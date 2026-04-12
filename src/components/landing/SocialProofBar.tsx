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
    <section className="bg-background py-8 md:py-12">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {indicators.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 md:p-6 text-center shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs md:text-sm font-medium leading-snug text-card-foreground">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
