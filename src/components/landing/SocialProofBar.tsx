import { Award, Headphones, Video, MessageCircle } from "lucide-react";

const indicators = [
  { icon: Award, text: "+5000 certificados emitidos" },
  { icon: Headphones, text: "Atendimento especializado" },
  { icon: Video, text: "Validação por videoconferência" },
  { icon: MessageCircle, text: "Suporte rápido" },
];

export const SocialProofBar = () => {
  return (
    <section className="bg-primary py-4">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {indicators.map((item, i) => (
            <div key={i} className="flex items-center gap-2 justify-center text-primary-foreground text-sm font-medium">
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
