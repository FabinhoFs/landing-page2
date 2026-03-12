import { Check, Headphones } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useCtaMessages } from "@/hooks/useCtaMessages";

interface DbPrice {
  id: string;
  name: string;
  price: number;
  promotional_price: number | null;
  is_promotion_active: boolean;
  promo_expires_at: string | null;
  feature_1: string;
  feature_2: string;
  feature_3: string;
  feature_4: string;
}

const SHARED_FEATURES = [
  "Assinar documentos de qualquer lugar com validade jurídica",
  "Acesso total ao e-CAC e serviços da Receita Federal",
  "Segurança garantida pelo padrão ICP-Brasil",
];

const fallbackProducts: DbPrice[] = [
  {
    id: "1",
    name: "e-CPF A1",
    price: 139.90,
    promotional_price: null,
    is_promotion_active: false,
    promo_expires_at: null,
    feature_1: SHARED_FEATURES[0],
    feature_2: SHARED_FEATURES[1],
    feature_3: SHARED_FEATURES[2],
    feature_4: "",
  },
  {
    id: "2",
    name: "e-CNPJ A1",
    price: 219.90,
    promotional_price: null,
    is_promotion_active: false,
    promo_expires_at: null,
    feature_1: SHARED_FEATURES[0],
    feature_2: SHARED_FEATURES[1],
    feature_3: SHARED_FEATURES[2],
    feature_4: "",
  },
];

function isPromoActive(item: DbPrice): boolean {
  if (!item.is_promotion_active || !item.promotional_price) return false;
  if (item.promo_expires_at && new Date(item.promo_expires_at) < new Date()) return false;
  return true;
}

function getTimeRemaining(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, total: diff };
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [time, setTime] = useState(getTimeRemaining(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const t = getTimeRemaining(expiresAt);
      setTime(t);
      if (!t) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!time) return null;

  return (
    <div className="mt-2 text-center">
      <p className="text-xs text-muted-foreground mb-1">⏰ Promoção termina em:</p>
      <div className="flex items-center justify-center gap-1 font-mono text-sm font-bold text-primary">
        <span className="bg-primary/10 rounded px-1.5 py-0.5">{String(time.h).padStart(2, "0")}h</span>
        <span>:</span>
        <span className="bg-primary/10 rounded px-1.5 py-0.5">{String(time.m).padStart(2, "0")}m</span>
        <span>:</span>
        <span className="bg-primary/10 rounded px-1.5 py-0.5">{String(time.s).padStart(2, "0")}s</span>
      </div>
    </div>
  );
}

interface PricingSectionProps {
  city: string;
  detected?: boolean;
}

export const PricingSection = ({ city, detected = false }: PricingSectionProps) => {
  const { settings, getMessage } = useCtaMessages();
  const fallbackSupportText = "Suporte completo e humanizado: em caso de qualquer dúvida, conte conosco do início ao fim.";
  const sectionTitle = settings.pricing_section_title || "Escolha a melhor modalidade de certificado para você";
  const { data: prices } = useQuery({
    queryKey: ["certificate_prices"],
    queryFn: async () => {
      const { data } = await supabase.from("certificate_prices").select("*");
      return data as unknown as DbPrice[] | null;
    },
    refetchInterval: 60000,
  });

  const products = prices && prices.length > 0
    ? prices.filter((p) => p.name.includes("A1")).map((p) => ({ ...p }))
    : fallbackProducts;

  const cardFeatures = [
    settings.social_experience_text || "Emissão oficial ICP-Brasil",
    settings.social_authority_title || "Rapidez e Segurança",
    settings.social_proof_text || "Junte-se a quem confia em nossa emissão oficial.",
    settings.social_support_text || settings.support_text || fallbackSupportText,
  ];

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-2xl font-bold text-foreground md:text-4xl mb-12 whitespace-nowrap md:whitespace-normal">
          {sectionTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
          {products.map((product) => {
            const promoActive = isPromoActive(product);

            return (
              <div
                key={product.id}
                className="rounded-2xl border border-border bg-card p-8 flex flex-col"
              >
                <h3 className="text-2xl font-bold text-card-foreground text-center">
                  {product.name}
                </h3>

                <div className="mt-4 text-center">
                  {promoActive ? (
                    <div>
                      <span className="text-lg text-muted-foreground line-through">
                        R$ {product.price.toFixed(2).replace(".", ",")}
                      </span>
                      <p className="text-4xl font-black text-primary">
                        R$ {product.promotional_price!.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-4xl font-black text-primary">
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </p>
                  )}
                </div>

                {promoActive && product.promo_expires_at && (
                  <Countdown expiresAt={product.promo_expires_at} />
                )}

                <ul className="mt-6 space-y-3 flex-1">
                  {SHARED_FEATURES.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Headphones className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <span>{supportText}</span>
                  </li>
                </ul>

                <WhatsAppButton
                  buttonId={`cta_pricing_${product.name.toLowerCase().replace(/\s+/g, "")}`}
                  message={
                    product.name.toLowerCase().includes("cpf")
                      ? getMessage("cta_ecpf", city)
                      : getMessage("cta_ecnpj", city)
                  }
                  className="mt-auto w-full text-base py-4 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
                >
                  Quero meu {product.name}
                </WhatsAppButton>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Clique para iniciar via WhatsApp • Atendimento imediato
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          🛠️ Suporte completo desde a validação até a instalação no seu computador
        </p>
      </div>
    </section>
  );
};
