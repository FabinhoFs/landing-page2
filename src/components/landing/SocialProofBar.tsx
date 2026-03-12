import { ShieldCheck, Zap, Users, Headphones } from "lucide-react";
import { useCtaMessages } from "@/hooks/useCtaMessages";

export const SocialProofBar = () => {
  const { settings } = useCtaMessages();

  const indicators = [
    { icon: ShieldCheck, text: settings.social_experience_text || "Emissão oficial ICP-Brasil" },
    { icon: Zap, text: settings.social_authority_title || "Rapidez e Segurança" },
    { icon: Users, text: settings.social_proof_text || "Junte-se a quem confia em nossa emissão oficial." },
    { icon: Headphones, text: settings.social_support_text || "Suporte completo e humanizado: em caso de qualquer dúvida, conte conosco do início ao fim." },
  ];

  return (
    <section className="bg-primary py-4">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-wrap gap-3 md:flex-nowrap md:gap-4">
          {indicators.map((item, i) => (
            <div
              key={i}
              className="flex basis-[calc(50%-0.375rem)] items-center justify-center gap-2 text-primary-foreground text-[11px] font-medium md:basis-0 md:flex-1 md:text-xs"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

