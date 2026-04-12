import { AlertTriangle, FileX, Clock, Ban, ShieldOff, Users } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { useCtaMessages } from "@/hooks/useCtaMessages";

const pains = [
  { icon: FileX, text: "Você não consegue emitir nota fiscal" },
  { icon: Ban, text: "Fica sem acesso a sistemas oficiais" },
  { icon: Clock, text: "Atrasa obrigações fiscais e operacionais" },
  { icon: ShieldOff, text: "Não consegue assinar documentos com validade" },
  { icon: AlertTriangle, text: "Perde tempo com burocracia e atendimento lento" },
  { icon: Users, text: "Fica dependente de terceiros para resolver algo urgente" },
];

export const PainSection = () => {
  const { getMessage } = useCtaMessages();

  return (
    <section className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
        <h2 className="text-2xl font-bold text-card-foreground md:text-4xl mb-4">
          Ficar sem Certificado Digital atrasa o que você precisa resolver hoje.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-10 max-w-3xl mx-auto text-left">
          {pains.map((p, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <p.icon className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <span className="text-sm text-card-foreground">{p.text}</span>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
          Resolva isso com um processo online, validado e acompanhado por atendimento especializado.
        </p>

        <div className="mt-6">
          <WhatsAppButton
            buttonId="cta_pain"
            message={getMessage("cta_hero")}
            className="text-base px-8 py-4 font-bold"
          >
            Quero falar no WhatsApp
          </WhatsAppButton>
        </div>
      </div>
    </section>
  );
};
