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

const DEFAULT_CPF_IDEAL = "Pessoa física, profissionais liberais e quem precisa acessar sistemas oficiais, assinar documentos e operar com mais praticidade no ambiente digital.";
const DEFAULT_CNPJ_IDEAL = "Empresas que precisam emitir notas, cumprir obrigações fiscais e acessar sistemas com segurança e agilidade.";
const DEFAULT_CPF_USOS = ["Assinatura digital de documentos", "Acesso ao e-CAC da Receita Federal", "Declaração de Imposto de Renda", "Rotinas digitais com mais segurança"];
const DEFAULT_CNPJ_USOS = ["Emissão de notas fiscais", "eSocial e obrigações fiscais", "Assinatura digital de documentos", "Acesso a sistemas públicos e privados"];
const DEFAULT_INCLUSO = [
  "Atendimento guiado no WhatsApp",
  "Orientação sobre documentos e etapas",
  "Validação online por videoconferência",
  "Suporte durante o processo",
  "Orientação para instalação e uso",
];

export const PricingSection = ({ city, detected = false, onTrackPurchase }: PricingSectionProps) => {
  const { settings, getMessage } = useCtaMessages();
  const sectionTitle = settings.pricing_section_title || "Escolha seu Certificado Digital e inicie sua emissão agora";

  const cpfIdeal = settings.pricing_cpf_ideal || DEFAULT_CPF_IDEAL;
  const cnpjIdeal = settings.pricing_cnpj_ideal || DEFAULT_CNPJ_IDEAL;

  let cpfUsos = DEFAULT_CPF_USOS;
  if (settings.pricing_cpf_usos) { try { cpfUsos = JSON.parse(settings.pricing_cpf_usos); } catch {} }

  let cnpjUsos = DEFAULT_CNPJ_USOS;
  if (settings.pricing_cnpj_usos) { try { cnpjUsos = JSON.parse(settings.pricing_cnpj_usos); } catch {} }

  let incluso = DEFAULT_INCLUSO;
  if (settings.pricing_incluso) { try { incluso = JSON.parse(settings.pricing_incluso); } catch {} }

  const cpfCtaText = settings.pricing_cta_cpf || "Quero iniciar meu e-CPF A1";
  const cnpjCtaText = settings.pricing_cta_cnpj || "Quero iniciar meu e-CNPJ A1";
  const microText = settings.pricing_micro || "Atendimento guiado • Validação online • Suporte durante o processo";

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
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="mb-12 text-center text-xl font-bold text-foreground sm:text-2xl md:text-3xl lg:text-4xl">
          {sectionTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {products.map((product) => {
            const promoActive = isPromoActive(product);
            const isCpf = product.name.toLowerCase().includes("cpf");
            const idealPara = isCpf ? cpfIdeal : cnpjIdeal;
            const usos = isCpf ? cpfUsos : cnpjUsos;
            const ctaText = isCpf ? cpfCtaText : cnpjCtaText;

            const isBestseller = bestsellerActive && (
              (bestsellerProduct === "cpf" && isCpf) ||
              (bestsellerProduct === "cnpj" && !isCpf)
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

                <p className="mt-3 text-xs text-muted-foreground text-center leading-relaxed">
                  {idealPara}
                </p>

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

                <div className="mt-5">
                  <p className="text-xs font-semibold text-card-foreground mb-2">Principais usos:</p>
                  <ul className="space-y-2">
                    {usos.map((uso, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckSquare className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                        <span>{uso}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-card-foreground mb-2">Incluso:</p>
                  <ul className="space-y-2">
                    {incluso.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckSquare className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-auto">
                  <WhatsAppButton
                    buttonId={`cta_pricing_${product.name.toLowerCase().replace(/\s+/g, "")}`}
                    message={
                      isCpf
                        ? getMessage("cta_ecpf", city)
                        : getMessage("cta_ecnpj", city)
                    }
                    className="w-full text-base py-4 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
                    onBeforeNavigate={() => {
                      const price = promoActive ? product.promotional_price! : product.price;
                      onTrackPurchase?.(price, product.name);
                    }}
                  >
                    {ctaText}
                  </WhatsAppButton>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    {microText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm md:text-base font-medium text-foreground text-center">
          <Headphones className="h-5 w-5 text-primary shrink-0" />
          <span>{settings.support_text || "Atendimento humano e orientação em todas as etapas do processo."}</span>
        </div>
      </div>
    </section>
  );
};
