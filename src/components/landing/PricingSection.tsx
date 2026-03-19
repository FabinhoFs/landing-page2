import { CheckSquare, Headphones } from "lucide-react";
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
}

interface DbFeature {
  id: string;
  certificate_id: string;
  text: string;
  icon: string;
  sort_order: number;
}

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
  onTrackPurchase?: (value: number, productName: string) => void;
}

const ICON_MAP: Record<string, typeof CheckSquare> = {
  check: CheckSquare,
  headphones: Headphones,
};

export const PricingSection = ({ city, detected = false }: PricingSectionProps) => {
  const { settings, getMessage } = useCtaMessages();
  const sectionTitle = settings.pricing_section_title || "Escolha a melhor modalidade de certificado para você";

  const { data: prices } = useQuery({
    queryKey: ["certificate_prices"],
    queryFn: async () => {
      const { data } = await supabase.from("certificate_prices").select("id, name, price, promotional_price, is_promotion_active, promo_expires_at");
      return data as unknown as DbPrice[] | null;
    },
    refetchInterval: 60000,
  });

  const { data: features } = useQuery({
    queryKey: ["certificate_features"],
    queryFn: async () => {
      const { data } = await supabase.from("certificate_features" as any).select("*").order("sort_order");
      return data as unknown as DbFeature[] | null;
    },
    refetchInterval: 60000,
  });

  const allProducts = prices?.filter((p) => p.name.includes("A1")) || [];
  const cpfProduct = allProducts.find(p => p.name.toLowerCase().includes("cpf"));
  const cnpjProduct = allProducts.find(p => p.name.toLowerCase().includes("cnpj"));
  const products = [cpfProduct, cnpjProduct].filter(Boolean) as DbPrice[];

  const bestsellerActive = settings.bestseller_active === "true";
  const bestsellerProduct = settings.bestseller_product || "cnpj";

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="mb-12 text-center text-xl font-bold text-foreground sm:text-2xl md:text-3xl lg:text-4xl whitespace-normal md:whitespace-nowrap">
          {sectionTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {products.map((product) => {
            const promoActive = isPromoActive(product);
            const productFeatures = (features || [])
              .filter(f => f.certificate_id === product.id)
              .sort((a, b) => a.sort_order - b.sort_order);

            const isBestseller = bestsellerActive && (
              (bestsellerProduct === "cpf" && product.name.toLowerCase().includes("cpf")) ||
              (bestsellerProduct === "cnpj" && product.name.toLowerCase().includes("cnpj"))
            );

            return (
              <div
                key={product.id}
                className={`relative rounded-2xl border bg-card p-6 md:p-8 flex flex-col ${isBestseller ? "border-primary shadow-lg" : "border-border"}`}
              >
                {isBestseller && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full shadow-md uppercase tracking-wide whitespace-nowrap">
                    ⭐ Mais Vendido
                  </div>
                )}
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
                  {productFeatures.map((feat) => {
                    const Icon = ICON_MAP[feat.icon] || CheckSquare;
                    return (
                      <li key={feat.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Icon className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                        <span className="whitespace-nowrap">{feat.text}</span>
                      </li>
                    );
                  })}
                </ul>

                <div className="pt-6">
                  <WhatsAppButton
                    buttonId={`cta_pricing_${product.name.toLowerCase().replace(/\s+/g, "")}`}
                    message={
                      product.name.toLowerCase().includes("cpf")
                        ? getMessage("cta_ecpf", city)
                        : getMessage("cta_ecnpj", city)
                    }
                    className="w-full text-base py-4 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
                  >
                    Quero meu {product.name}
                  </WhatsAppButton>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Clique para iniciar via WhatsApp • Atendimento imediato
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm md:text-base font-medium text-foreground text-center">
          <Headphones className="h-5 w-5 text-primary shrink-0" />
          <span>{settings.support_text || "Suporte completo e humanizado: em caso de qualquer dúvida, conte conosco do início ao fim."}</span>
        </div>
      </div>
    </section>
  );
};
