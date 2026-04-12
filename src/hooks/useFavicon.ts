import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches the favicon URL from site_settings and applies it to the document head.
 * Falls back to /favicon.ico if not configured.
 */
export function useFavicon() {
  useEffect(() => {
    const apply = async () => {
      const { data } = await supabase
        .from("site_settings" as any)
        .select("value")
        .eq("key", "favicon_url")
        .maybeSingle();

      const url = (data as any)?.value;
      if (!url) return;

      // Determine type from extension
      let type = "image/x-icon";
      if (url.endsWith(".png")) type = "image/png";
      else if (url.endsWith(".svg")) type = "image/svg+xml";
      else if (url.endsWith(".ico")) type = "image/x-icon";

      // Remove existing favicon links
      document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(el => el.remove());

      const link = document.createElement("link");
      link.rel = "icon";
      link.type = type;
      link.href = url;
      document.head.appendChild(link);
    };

    apply();
  }, []);
}
