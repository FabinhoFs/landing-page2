import { supabase } from "@/integrations/supabase/client";

let cachedGeo: { ip?: string; city?: string; region?: string } | null = null;

const getGeoData = async () => {
  if (cachedGeo) return cachedGeo;
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    cachedGeo = { ip: data.ip, city: data.city, region: data.region };
  } catch {
    cachedGeo = {};
  }
  return cachedGeo;
};

const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return "Mobile";
  return "Desktop";
};

/** Capture UTM params from URL and persist in sessionStorage */
export const captureUtmParams = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    const utms: Record<string, string> = {};
    let hasUtm = false;
    utmKeys.forEach((k) => {
      const v = params.get(k);
      if (v) { utms[k] = v; hasUtm = true; }
    });
    if (hasUtm) {
      sessionStorage.setItem("agis_utm", JSON.stringify(utms));
    }
  } catch {
    // silent
  }
};

/** Get stored UTM params */
export const getStoredUtms = (): Record<string, string> | null => {
  try {
    const raw = sessionStorage.getItem("agis_utm");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const logAccess = async (buttonId: string) => {
  try {
    const allowed = await checkRateLimit("logAccess");
    if (!allowed) return;
    const geo = await getGeoData();
    const utms = getStoredUtms();
    // Encode UTM data into user_agent after delimiter for analytics
    let ua = navigator.userAgent;
    if (utms && Object.keys(utms).length > 0) {
      ua += `|||${JSON.stringify(utms)}`;
    }
    await supabase.from("access_logs").insert([{
      button_id: buttonId,
      ip: geo.ip || null,
      city: geo.city || null,
      region: geo.region || null,
      device: getDeviceType(),
      user_agent: ua,
    }]);
  } catch {
    // silent fail
  }
};
