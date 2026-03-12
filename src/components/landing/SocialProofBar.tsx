import { ShieldCheck, Zap, Users, Headphones } from "lucide-react";
import { useCtaMessages } from "@/hooks/useCtaMessages";

export const SocialProofBar = () => {
  const { settings } = useCtaMessages();

  const indicators = [
    { icon: ShieldCheck, text: settings.social_experience_text || "Emissão oficial ICP-Brasil" },
    { icon: Zap, text: settings.social_authority_title || "Rapidez e Segurança" },
    { icon: Users, text: settings.social_proof_text || "Junte-se a centenas de clientes que confiam em nossa emissão oficial." },
    { icon: Headphones, text: settings.social_support_text || "Suporte completo e humanizado: conte conosco do início ao fim." },
  ];

  return (
    <section className="bg-primary py-4">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {indicators.map((item, i) => (
            <div key={i} className="flex items-center gap-2 justify-center text-primary-foreground text-xs md:text-sm font-medium whitespace-nowrap">
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
