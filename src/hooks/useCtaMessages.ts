import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCtaMessages() {
  const { data } = useQuery({
    queryKey: ["site_settings", "all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings" as any)
        .select("key, value");
      const map: Record<string, string> = {};
      if (data) {
        (data as any[]).forEach((row: any) => {
          map[row.key] = row.value;
        });
      }
      return map;
    },
    staleTime: 60000,
  });

  const getMessage = (ctaKey: string, city?: string | null) => {
    const template = data?.[ctaKey] || "";
    if (!template) return "";
    return template.replace(/\{cidade\}/g, city || "Brasil");
  };

  return { settings: data || {}, getMessage };
}
