import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_CTA_MESSAGES: Record<string, string> = {
  cta_hero: "Olá! Quero emitir meu Certificado Digital em {cidade}.",
  cta_header: "Olá! Quero falar com um especialista em Certificado Digital em {cidade}.",
  cta_pain: "Olá! Quero resolver minha situação e emitir meu Certificado Digital em {cidade}.",
  cta_ecpf: "Olá! Quero emitir meu e-CPF A1 em {cidade}.",
  cta_ecnpj: "Olá! Quero emitir meu e-CNPJ A1 em {cidade}.",
  cta_guarantee: "Olá! Quero tirar dúvidas sobre Certificado Digital em {cidade}.",
  cta_faq: "Olá! Tenho dúvidas sobre Certificado Digital em {cidade}.",
  cta_floating: "Olá! Quero atendimento rápido para emitir meu Certificado Digital.",
  cta_sticky_mobile: "Olá! Quero emitir meu Certificado Digital agora.",
  cta_bottom: "Olá! Quero iniciar a emissão do meu Certificado Digital.",
  cta_exit_popup: "Olá! Vi o desconto e quero aproveitar agora.",
};

export function useCtaMessages() {
  // Determine if we're in preview mode (admin viewing draft)
  const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "draft";
  const env = isPreview ? "draft" : "published";

  const { data, isLoading } = useQuery({
    queryKey: ["site_settings", env],
    queryFn: async () => {
      // For draft preview, verify admin auth first
      if (isPreview) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Not authenticated — fallback to published
          const { data: pubData } = await supabase
            .from("site_settings" as any)
            .select("key, value")
            .eq("environment", "published");
          const map: Record<string, string> = {};
          if (pubData) (pubData as any[]).forEach((row: any) => { map[row.key] = row.value; });
          return map;
        }
      }

      const { data } = await supabase
        .from("site_settings" as any)
        .select("key, value")
        .eq("environment", env);
      const map: Record<string, string> = {};
      if (data) {
        (data as any[]).forEach((row: any) => {
          map[row.key] = row.value;
        });
      }
      return map;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const getMessage = (ctaKey: string, city?: string | null) => {
    const template = data?.[ctaKey] || DEFAULT_CTA_MESSAGES[ctaKey] || "Olá! Quero emitir meu Certificado Digital.";
    return template.replace(/\{cidade\}/g, city || "Brasil");
  };

  return { settings: data || {}, getMessage, isLoading };
}
