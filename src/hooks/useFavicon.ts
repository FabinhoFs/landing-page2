import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches the favicon URL from published site_settings and applies it to the document head.
 */
export function useFavicon() {
  useEffect(() => {
    const apply = async () => {
      const { data } = await supabase
        .from("site_settings" as any)
        .select("value")
        .eq("key", "favicon_url")
        .eq("environment", "published")
        .maybeSingle();

      const url = (data as any)?.value || "/favicon.png";

      let type = "image/x-icon";
      if (url.endsWith(".png")) type = "image/png";
      else if (url.endsWith(".svg")) type = "image/svg+xml";
      else if (url.endsWith(".ico")) type = "image/x-icon";

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
