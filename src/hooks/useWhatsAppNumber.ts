import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FALLBACK = "5524974022516";

export function useWhatsAppNumber() {
  const { data } = useQuery({
    queryKey: ["site_settings", "whatsapp_number"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings" as any)
        .select("value")
        .eq("key", "whatsapp_number")
        .maybeSingle();
      return ((data as any)?.value as string | null)?.replace(/\D/g, "") || null;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return data || FALLBACK;
}

