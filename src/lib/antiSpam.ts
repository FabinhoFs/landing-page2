import { supabase } from "@/integrations/supabase/client";

interface SpamConfig {
  enabled: boolean;
  maxRequests: number;
  windowMs: number;
}

let cachedConfig: SpamConfig | null = null;
let configLoadedAt = 0;
const CONFIG_TTL = 60_000; // cache config for 1 minute

const DEFAULTS: SpamConfig = {
  enabled: true,
  maxRequests: 20,
  windowMs: 60_000,
};

async function loadConfig(): Promise<SpamConfig> {
  const now = Date.now();
  if (cachedConfig && now - configLoadedAt < CONFIG_TTL) return cachedConfig;

  try {
    const { data } = await (supabase.from("site_settings") as any)
      .select("key, value")
      .eq("environment", "published")
      .in("key", ["spam_guard_enabled", "spam_max_requests", "spam_window_ms"]);

    const config = { ...DEFAULTS };
    if (data) {
      for (const row of data) {
        if (row.key === "spam_guard_enabled") config.enabled = row.value !== "false";
        if (row.key === "spam_max_requests") config.maxRequests = parseInt(row.value, 10) || DEFAULTS.maxRequests;
        if (row.key === "spam_window_ms") config.windowMs = parseInt(row.value, 10) || DEFAULTS.windowMs;
      }
    }
    cachedConfig = config;
    configLoadedAt = now;
    return config;
  } catch {
    return DEFAULTS;
  }
}

/**
 * Checks if the action is within rate limits.
 * Returns `true` if allowed, `false` if blocked.
 */
export async function checkRateLimit(action: string): Promise<boolean> {
  try {
    const config = await loadConfig();
    if (!config.enabled) return true;

    const storageKey = `spam_guard_${action}`;
    const now = Date.now();

    let timestamps: number[] = [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) timestamps = JSON.parse(raw);
    } catch {
      timestamps = [];
    }

    // Remove timestamps outside the window
    timestamps = timestamps.filter((t) => now - t < config.windowMs);

    if (timestamps.length >= config.maxRequests) {
      return false; // blocked
    }

    timestamps.push(now);
    localStorage.setItem(storageKey, JSON.stringify(timestamps));
    return true;
  } catch {
    // If anti-spam itself fails, allow the action
    return true;
  }
}
