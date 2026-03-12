import { Check, ShieldCheck } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fallbackProducts = [
  {
    name: "e-CPF",
    price: 127,
    promotional_price: null as number | null,
    is_promotion_active: false,
    features: [
      "Assinar documentos de qualquer lugar com validade jurídica",
      "Acesso total ao e-CAC e serviços da Receita Federal",
      "Segurança garantida pelo padrão ICP-Brasil",
      "Declaração de IR e consultas sem filas ou burocracia",
    ],
  },
  {
    name: "e-CNPJ",
    price: 177,
    promotional_price: null as number | null,
    is_promotion_active: false,
    features: [
      "Emissão de notas fiscais (NF-e/NFC-e) sem interrupções",
      "Conformidade total com FGTS, e-Social e obrigações acessórias",
      "Gestão segura de contratos e procurações digitais",
      "Autenticação empresarial em sistemas públicos e privados",
    ],
  },
];

interface PricingSectionProps {
  city: string;
  detected?: boolean;
}

export const PricingSection = ({ city, detected = false }: PricingSectionProps) => {
  const { data: prices } = useQuery({
    queryKey: ["certificate_prices"],
    queryFn: async () => {
      const { data } = await supabase.from("certificate_prices").select("*");
      return data;
    },
  });

  const products = fallbackProducts.map((fb) => {
    const dbPrice = prices?.find((p) => p.name === fb.name);
    return {
      ...fb,
      price: dbPrice?.price ?? fb.price,
      promotional_price: dbPrice?.promotional_price ?? fb.promotional_price,
      is_promotion_active: dbPrice?.is_promotion_active ?? fb.is_promotion_active,
    };
  });

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl mb-12">
          Escolha melhor a modalidade de certificado para você
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product) => (
            <div
              key={product.name}
              className="rounded-2xl border border-border bg-card p-8 flex flex-col"
            >
              <h3 className="text-2xl font-bold text-card-foreground text-center">
                {product.name}
              </h3>

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">A partir de</p>
                {product.is_promotion_active && product.promotional_price ? (
                  <div>
                    <span className="text-lg text-muted-foreground line-through">
                      R$ {product.price}
                    </span>
                    <p className="text-4xl font-black text-primary">
                      R$ {product.promotional_price}
                    </p>
                  </div>
                ) : (
                  <p className="text-4xl font-black text-primary">
                    R$ {product.price}
                  </p>
                )}
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Certificação ICP-Brasil
              </div>

              <WhatsAppButton
                buttonId={`cta_pricing_${product.name.toLowerCase().replace("-", "")}`}
                message={
                  detected
                    ? `Olá! Vi o site e quero meu ${product.name}. Estou em ${city}, como iniciamos?`
                    : `Olá! Vi o site e quero meu certificado agora. Como iniciamos?`
                }
                className="mt-4 w-full text-base py-4 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
              >
                Quero meu {product.name}
              </WhatsAppButton>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Clique para iniciar via WhatsApp • Atendimento imediato
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          🛠️ Suporte completo desde a validação até a instalação no seu computador
        </p>
      </div>
    </section>
  );
};
