import { supabase } from "@/integrations/supabase/client";

let cachedGeo: { ip?: string; city?: string } | null = null;

const getGeoData = async () => {
  if (cachedGeo) return cachedGeo;
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    cachedGeo = { ip: data.ip, city: data.city };
  } catch {
    cachedGeo = {};
  }
  return cachedGeo;
};

export const logAccess = async (buttonId: string) => {
  try {
    const geo = await getGeoData();
    await supabase.from("access_logs").insert([{
      button_id: buttonId,
      ip: geo.ip || null,
      city: geo.city || null,
      user_agent: navigator.userAgent,
    }]);
  } catch {
    // silent fail – don't block user
  }
};
