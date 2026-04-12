import { WhatsAppButton } from "./WhatsAppButton";
import { useCtaMessages } from "@/hooks/useCtaMessages";
import { ShieldCheck, Zap, MessageCircle } from "lucide-react";

interface CTASectionProps {
  city: string;
}

const bullets = [
  { icon: Zap, text: "Processo online" },
  { icon: ShieldCheck, text: "Validação rápida" },
  { icon: MessageCircle, text: "Atendimento no WhatsApp" },
];

export const CTASection = ({ city }: CTASectionProps) => {
  const { settings, getMessage } = useCtaMessages();

  const title = settings.cta_section_title || "Inicie sua emissão hoje com atendimento imediato";
  const subtitle = settings.cta_section_subtitle || "Fale com um especialista, escolha o certificado certo e conclua seu processo com mais clareza, suporte humano e praticidade.";
  const buttonText = settings.cta_section_button || "Quero iniciar minha emissão agora";
  const microText = settings.cta_section_micro || "Atendimento humano • Processo simples • Emissão com suporte especializado";

  return (
    <section className="bg-deep text-deep-foreground py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6 text-center">
        <h2 className="text-2xl font-bold md:text-4xl mb-3">{title}</h2>
        <p className="text-sm md:text-base text-deep-foreground/70 mb-8 max-w-xl mx-auto">{subtitle}</p>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {bullets.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-deep-foreground/80">
              <b.icon className="h-4 w-4 text-primary" />
              <span>{b.text}</span>
            </div>
          ))}
        </div>

        <WhatsAppButton
          buttonId="cta_bottom"
          message={getMessage("cta_bottom", city)}
          className="text-base px-8 py-5 font-bold"
        >
          {buttonText}
        </WhatsAppButton>

        <p className="mt-4 text-xs text-deep-foreground/50">{microText}</p>
      </div>
    </section>
  );
};
