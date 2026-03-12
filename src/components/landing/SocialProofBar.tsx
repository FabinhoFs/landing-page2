import { Award, HeartHandshake, Video, Users } from "lucide-react";
import { useCtaMessages } from "@/hooks/useCtaMessages";

export const SocialProofBar = () => {
  const { settings } = useCtaMessages();

  const authorityTitle = settings.social_authority_title || "Atendimento humanizado";
  const proofText = settings.social_proof_text || "Junte-se a centenas de clientes que confiam em nossa emissão oficial.";
  const experienceText = settings.social_experience_text || "Milhares de certificados emitidos com segurança";

  const indicators = [
    { icon: Award, text: experienceText },
    { icon: HeartHandshake, text: authorityTitle },
    { icon: Video, text: "Validação por videoconferência" },
    { icon: Users, text: proofText },
  ];

  return (
    <section className="bg-primary py-4">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {indicators.map((item, i) => (
            <div key={i} className="flex items-center gap-2 justify-center text-primary-foreground text-sm font-medium">
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="transition-opacity duration-500">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
