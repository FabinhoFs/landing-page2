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

export const logAccess = async (buttonId: string) => {
  try {
    const geo = await getGeoData();
    await supabase.from("access_logs").insert([{
      button_id: buttonId,
      ip: geo.ip || null,
      city: geo.city || null,
      region: geo.region || null,
      device: getDeviceType(),
      user_agent: navigator.userAgent,
    }]);
  } catch {
    // silent fail
  }
};
