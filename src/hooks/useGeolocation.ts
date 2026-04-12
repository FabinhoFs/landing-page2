import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "dtr_city";
const SAFE_FALLBACK = "sua região";

type GeoProvider = "ipapi" | "ip-api" | "cloudflare";

interface GeoConfig {
  provider: GeoProvider;
  apiKey: string;
  fallback: boolean;
}

const PROVIDER_ORDER: GeoProvider[] = ["ipapi", "ip-api", "cloudflare"];

async function fetchFromProvider(
  provider: GeoProvider,
  apiKey: string,
  signal: AbortSignal
): Promise<string | null> {
  try {
    let url: string;
    switch (provider) {
      case "ipapi":
        url = apiKey
          ? `https://ipapi.co/json/?key=${apiKey}`
          : "https://ipapi.co/json/";
        break;
      case "ip-api":
        url = "http://ip-api.com/json/?fields=city";
        break;
      case "cloudflare":
        url = "/api/geo";
        break;
    }

    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    const city = data?.city;
    return city && city !== "" && city !== "undefined" ? city : null;
  } catch {
    return null;
  }
}

async function loadGeoConfig(): Promise<GeoConfig> {
  const defaults: GeoConfig = { provider: "ipapi", apiKey: "", fallback: true };
  try {
    const { data } = await (supabase.from("site_settings") as any)
      .select("key, value")
      .eq("environment", "published")
      .in("key", ["geo_provider", "geo_api_key", "geo_fallback"]);

    if (!data) return defaults;
    for (const row of data) {
      if (row.key === "geo_provider") defaults.provider = row.value as GeoProvider;
      if (row.key === "geo_api_key") defaults.apiKey = row.value;
      if (row.key === "geo_fallback") defaults.fallback = row.value === "true";
    }
  } catch {
    // keep defaults
  }
  return defaults;
}

export const useGeolocation = () => {
  const [city, setCity] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCity = params.get("cidade");
    if (urlCity) {
      localStorage.setItem(STORAGE_KEY, urlCity);
      return urlCity;
    }
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) return cached;
    return null;
  });

  const [detected, setDetected] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return !!params.get("cidade") || !!localStorage.getItem(STORAGE_KEY);
  });

  useEffect(() => {
    if (city) return;

    const controller = new AbortController();

    (async () => {
      const config = await loadGeoConfig();

      // Build provider chain: configured first, then others if fallback is on
      const chain: GeoProvider[] = [config.provider];
      if (config.fallback) {
        for (const p of PROVIDER_ORDER) {
          if (!chain.includes(p)) chain.push(p);
        }
      }

      for (const provider of chain) {
        if (controller.signal.aborted) return;
        const result = await fetchFromProvider(
          provider,
          provider === config.provider ? config.apiKey : "",
          controller.signal
        );
        if (result) {
          localStorage.setItem(STORAGE_KEY, result);
          setCity(result);
          setDetected(true);
          return;
        }
      }
      // All failed — city stays null, cityDisplay will use SAFE_FALLBACK
    })();

    return () => controller.abort();
  }, [city]);

  return { city, detected, safeFallback: SAFE_FALLBACK };
};
