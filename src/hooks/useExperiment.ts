import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { checkRateLimit } from "@/lib/antiSpam";

interface ExperimentVariant {
  variant_key: string;
  label: string;
  config: Record<string, string>;
}

interface ActiveExperiment {
  id: string;
  name: string;
  section: string;
  experiment_type: string;
  traffic_split: Record<string, number>;
  variants: ExperimentVariant[];
}

// Generate or retrieve a persistent session ID for consistent variant assignment
function getSessionId(): string {
  const KEY = "agis_exp_session";
  let sid = sessionStorage.getItem(KEY);
  if (!sid) {
    sid = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(KEY, sid);
  }
  return sid;
}

// Deterministic variant assignment based on session ID and traffic split
function assignVariant(sessionId: string, experimentId: string, trafficSplit: Record<string, number>): string {
  // Simple hash from session + experiment
  let hash = 0;
  const str = sessionId + experimentId;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const bucket = Math.abs(hash) % 100;

  const entries = Object.entries(trafficSplit).sort(([a], [b]) => a.localeCompare(b));
  let cumulative = 0;
  for (const [key, pct] of entries) {
    cumulative += pct;
    if (bucket < cumulative) return key;
  }
  return entries[0]?.[0] || "A";
}

/**
 * Hook for the public landing page.
 * Fetches active experiments for a given section, assigns a variant, and tracks impressions.
 */
export function useExperiment(section: string) {
  const [assignedVariant, setAssignedVariant] = useState<string | null>(null);
  const [variantConfig, setVariantConfig] = useState<Record<string, string>>({});
  const [experimentId, setExperimentId] = useState<string | null>(null);
  const impressionLogged = useRef(false);

  const { data: experiment } = useQuery<ActiveExperiment | null>({
    queryKey: ["active_experiment", section],
    queryFn: async () => {
      // Fetch active experiment for this section
      const { data: expRows } = await supabase
        .from("experiments" as any)
        .select("id, name, section, experiment_type, traffic_split")
        .eq("section", section)
        .eq("status", "active")
        .limit(1);

      const exp = (expRows as any[])?.[0];
      if (!exp) return null;

      // Fetch variants
      const { data: varRows } = await supabase
        .from("experiment_variants" as any)
        .select("variant_key, label, config")
        .eq("experiment_id", exp.id);

      return {
        id: exp.id,
        name: exp.name,
        section: exp.section,
        experiment_type: exp.experiment_type,
        traffic_split: exp.traffic_split as Record<string, number>,
        variants: ((varRows as any[]) || []).map((v: any) => ({
          variant_key: v.variant_key,
          label: v.label,
          config: v.config as Record<string, string>,
        })),
      };
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!experiment) {
      setAssignedVariant(null);
      setVariantConfig({});
      setExperimentId(null);
      return;
    }

    const sessionId = getSessionId();
    const variant = assignVariant(sessionId, experiment.id, experiment.traffic_split);
    setAssignedVariant(variant);
    setExperimentId(experiment.id);

    const vData = experiment.variants.find(v => v.variant_key === variant);
    setVariantConfig(vData?.config || {});

    // Log impression once per session per experiment
    if (!impressionLogged.current) {
      impressionLogged.current = true;
      logExperimentEvent(experiment.id, variant, "impression", undefined, sessionId);
    }
  }, [experiment]);

  const trackClick = useCallback((buttonId?: string) => {
    if (!experimentId || !assignedVariant) return;
    const sessionId = getSessionId();
    logExperimentEvent(experimentId, assignedVariant, "click", buttonId, sessionId);
  }, [experimentId, assignedVariant]);

  return {
    isExperimentActive: !!experiment,
    experimentId,
    assignedVariant,
    variantConfig,
    trackClick,
  };
}

async function logExperimentEvent(
  experimentId: string,
  variantKey: string,
  eventType: string,
  buttonId?: string,
  sessionId?: string,
) {
  try {
    const allowed = await checkRateLimit("experimentEvent");
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

    await supabase.from("experiment_events" as any).insert({
      experiment_id: experimentId,
      variant_key: variantKey,
      event_type: eventType,
      button_id: buttonId || null,
      session_id: sessionId || null,
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
