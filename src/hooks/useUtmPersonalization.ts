import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getStoredUtms } from "@/lib/logAccess";
import { checkRateLimit } from "@/lib/antiSpam";

interface UtmRule {
  id: string;
  name: string;
  priority: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  overrides: Record<string, string>;
}

/**
 * Scores how well a rule matches the current UTM params.
 * Returns -1 if the rule does NOT match.
 * Otherwise returns the number of matched fields (higher = more specific).
 */
function scoreRule(rule: UtmRule, utms: Record<string, string>): number {
  const fields: Array<[string, string | null]> = [
    ["utm_source", rule.utm_source],
    ["utm_medium", rule.utm_medium],
    ["utm_campaign", rule.utm_campaign],
    ["utm_content", rule.utm_content],
    ["utm_term", rule.utm_term],
  ];

  let matched = 0;
  let hasAnyCondition = false;

  for (const [key, ruleValue] of fields) {
    if (!ruleValue || ruleValue.trim() === "") continue;
    hasAnyCondition = true;
    const visitValue = utms[key];
    if (!visitValue || visitValue.toLowerCase() !== ruleValue.toLowerCase()) {
      return -1; // mismatch → rule doesn't apply
    }
    matched++;
  }

  // A rule with no conditions matches nothing
  if (!hasAnyCondition) return -1;
  return matched;
}

/**
 * Finds the best matching rule: highest priority first, then most specific, then most recent (by array order).
 */
function findBestRule(rules: UtmRule[], utms: Record<string, string>): UtmRule | null {
  let best: UtmRule | null = null;
  let bestPriority = -Infinity;
  let bestScore = -1;

  for (const rule of rules) {
    const score = scoreRule(rule, utms);
    if (score < 0) continue;

    if (
      rule.priority > bestPriority ||
      (rule.priority === bestPriority && score > bestScore)
    ) {
      best = rule;
      bestPriority = rule.priority;
      bestScore = score;
    }
  }

  return best;
}

/**
 * Hook for the public landing page.
 * Fetches active UTM rules, matches against current visit UTMs,
 * and returns field overrides + tracking function.
 */
export function useUtmPersonalization() {
  const [matchedRule, setMatchedRule] = useState<UtmRule | null>(null);
  const impressionLogged = useRef(false);

  const { data: rules } = useQuery<UtmRule[]>({
    queryKey: ["utm_rules_active"],
    queryFn: async () => {
      const { data } = await supabase
        .from("utm_rules" as any)
        .select("id, name, priority, utm_source, utm_medium, utm_campaign, utm_content, utm_term, overrides")
        .eq("status", "active")
        .order("priority", { ascending: false });

      return ((data as any[]) || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        priority: r.priority,
        utm_source: r.utm_source,
        utm_medium: r.utm_medium,
        utm_campaign: r.utm_campaign,
        utm_content: r.utm_content,
        utm_term: r.utm_term,
        overrides: (r.overrides as Record<string, string>) || {},
      }));
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!rules || rules.length === 0) {
      setMatchedRule(null);
      return;
    }

    const utms = getStoredUtms();
    if (!utms || Object.keys(utms).length === 0) {
      setMatchedRule(null);
      return;
    }

    const best = findBestRule(rules, utms);
    setMatchedRule(best);

    // Log impression once
    if (best && !impressionLogged.current) {
      impressionLogged.current = true;
      logUtmEvent(best, utms, "impression");
    }
  }, [rules]);

  const getOverride = useCallback(
    (field: string): string | undefined => {
      return matchedRule?.overrides[field];
    },
    [matchedRule]
  );

  const trackClick = useCallback(
    (buttonId: string) => {
      if (!matchedRule) return;
      const utms = getStoredUtms();
      logUtmEvent(matchedRule, utms || {}, "click", buttonId);
    },
    [matchedRule]
  );

  return {
    isPersonalized: !!matchedRule,
    ruleName: matchedRule?.name || null,
    ruleId: matchedRule?.id || null,
    overrides: matchedRule?.overrides || {},
    getOverride,
    trackClick,
  };
}

async function logUtmEvent(
  rule: UtmRule,
  utms: Record<string, string>,
  eventType: string,
  buttonId?: string,
) {
  try {
    const allowed = await checkRateLimit("utmEvent");
    if (!allowed) return;
    const deviceType = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "Mobile" : "Desktop";
    let city: string | undefined;
    let region: string | undefined;
    let ip: string | undefined;
    try {
      const cached = sessionStorage.getItem("agis_geo");
      if (cached) {
        const g = JSON.parse(cached);
        city = g.city; region = g.region; ip = g.ip;
      }
    } catch {}

    const sid = sessionStorage.getItem("agis_exp_session") || undefined;

    await supabase.from("utm_events" as any).insert({
      rule_id: rule.id,
      rule_name: rule.name,
      event_type: eventType,
      button_id: buttonId || null,
      session_id: sid || null,
      utm_source: utms.utm_source || null,
      utm_medium: utms.utm_medium || null,
      utm_campaign: utms.utm_campaign || null,
      utm_content: utms.utm_content || null,
      utm_term: utms.utm_term || null,
      overrides_applied: rule.overrides,
      ip: ip || null,
      city: city || null,
      region: region || null,
      device: deviceType,
      user_agent: navigator.userAgent,
    } as any);
  } catch {
    // silent fail
  }
}
