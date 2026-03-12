import { Award, Headphones, Video, Users } from "lucide-react";

interface SocialProofBarProps {
  city: string | null;
  detected: boolean;
}

export const SocialProofBar = ({ city, detected }: SocialProofBarProps) => {
  const socialText = detected
    ? `Junte-se a centenas de clientes satisfeitos em ${city}`
    : "Junte-se a milhares de clientes satisfeitos em todo o Brasil";

  const indicators = [
    { icon: Award, text: "+5000 certificados emitidos" },
    { icon: Headphones, text: "Atendimento especializado" },
    { icon: Video, text: "Validação por videoconferência" },
    { icon: Users, text: socialText },
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
