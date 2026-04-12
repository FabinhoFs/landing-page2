import { ShieldCheck, Headphones, CheckCircle } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { useCtaMessages } from "@/hooks/useCtaMessages";

const points = [
  "Atendimento humano durante o processo",
  "Orientação para seguir corretamente cada etapa",
  "Mais segurança para contratar com clareza",
];

export const GuaranteeSection = ({ city }: { city: string }) => {
  const { getMessage } = useCtaMessages();

  return (
    <section className="bg-deep text-deep-foreground py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mb-6">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-2xl font-bold md:text-4xl mb-4">
          Mais segurança para você contratar
        </h2>

        <p className="text-sm md:text-base text-deep-foreground/80 leading-relaxed max-w-xl mx-auto mb-8">
          Você conta com atendimento humano e orientação em todas as etapas do processo. Nossa equipe esclarece dúvidas, explica o fluxo e acompanha você com mais segurança e clareza.
        </p>

        <div className="flex flex-col gap-3 max-w-md mx-auto mb-8 text-left">
          {points.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm text-deep-foreground/80">{p}</span>
            </div>
          ))}
        </div>

        <WhatsAppButton
          buttonId="cta_guarantee"
          message={getMessage("cta_hero", city)}
          className="text-base px-8 py-4 font-bold"
        >
          Tirar dúvidas agora
        </WhatsAppButton>
      </div>
    </section>
  );
};
