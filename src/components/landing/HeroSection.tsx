import { useState } from "react";
import { WhatsAppButton } from "./WhatsAppButton";
import { ShieldCheck, Zap, MessageCircle, Video, Headphones } from "lucide-react";
import { useCtaMessages } from "@/hooks/useCtaMessages";

interface HeroSectionProps {
  city: string | null;
  detected: boolean;
}

const bullets = [
  { icon: MessageCircle, label: "Atendimento guiado no WhatsApp" },
  { icon: Video, label: "Validação online sem sair de casa" },
  { icon: Headphones, label: "Suporte humano em cada etapa" },
];

interface HeroVariant {
  headline: string;
  subheadline: string;
  dynamicLine: (city: string | null, detected: boolean) => string;
  ctaPrimary: string;
  ctaSecondary: string;
}

const variants: HeroVariant[] = [
  {
    headline: "Seu Certificado Digital\npronto no mesmo dia.",
    subheadline: "Validação por videoconferência em poucos minutos, com atendimento humano do início ao fim.",
    dynamicLine: (city, detected) =>
      detected && city
        ? `Atendimento online para ${city} e todo o Brasil.`
        : "Atendimento online em todo o Brasil.",
    ctaPrimary: "Iniciar emissão",
    ctaSecondary: "Falar com especialista",
  },
  {
    headline: "Emita seu Certificado Digital online\ncom atendimento imediato.",
    subheadline: "Faça sua validação por videoconferência e conclua sua emissão com suporte humano, em um processo simples e 100% online.",
    dynamicLine: (city, detected) =>
      detected && city
        ? `Atendimento para clientes de ${city} e de todo o Brasil.`
        : "Atendimento para clientes de todo o Brasil.",
    ctaPrimary: "Iniciar minha emissão",
    ctaSecondary: "Falar com especialista",
  },
  {
    headline: "Certificado Digital online\ncom validação rápida.",
    subheadline: "Atendimento humano, processo simples e suporte em cada etapa da sua emissão.",
    dynamicLine: (city, detected) =>
      detected && city
        ? `Disponível para ${city} e todo o Brasil.`
        : "Disponível em todo o Brasil.",
    ctaPrimary: "Iniciar emissão agora",
    ctaSecondary: "Quero falar no WhatsApp",
  },
];

export const HeroSection = ({ city, detected }: HeroSectionProps) => {
  const [activeVariant, setActiveVariant] = useState(0);
  const { getMessage } = useCtaMessages();
  const heroMsg = getMessage("cta_hero", city);
  const v = variants[activeVariant];

  return (
    <section className="relative bg-deep text-deep-foreground overflow-hidden pt-20">
      {/* Subtle background */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 30% 50%, hsl(276 55% 33% / 0.12) 0%, transparent 60%)"
      }} />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-28">
        <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
          {/* Variant selector — testing only */}
          <div className="flex justify-center gap-2">
            {variants.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveVariant(i)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeVariant === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-deep-foreground/10 text-deep-foreground/60 hover:bg-deep-foreground/20"
                }`}
              >
                V{i + 1}
              </button>
            ))}
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-foreground">
            <Zap className="h-4 w-4" />
            Atendimento imediato
          </div>

          {/* Headline */}
          <h1 className="text-2xl font-extrabold leading-tight md:text-4xl lg:text-5xl whitespace-pre-line">
            {v.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-sm md:text-lg text-deep-foreground/80 leading-relaxed max-w-xl mx-auto">
            {v.subheadline}
          </p>

          {/* Dynamic city line */}
          <p className="text-xs md:text-sm text-deep-foreground/60 font-medium">
            {v.dynamicLine(city, detected)}
          </p>

          {/* Bullets */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-deep-foreground/80">
                <b.icon className="h-4 w-4 text-primary shrink-0" />
                <span>{b.label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <WhatsAppButton
              buttonId="cta_hero_primary"
              message={heroMsg}
              className="text-base px-6 md:px-8 py-4 md:py-5 font-bold"
            >
              {v.ctaPrimary}
            </WhatsAppButton>
            <WhatsAppButton
              buttonId="cta_hero_secondary"
              message={getMessage("cta_header", city)}
              className="text-base px-6 md:px-8 py-4 md:py-5 font-bold bg-transparent border-2 border-deep-foreground/30 text-deep-foreground hover:bg-deep-foreground/10"
            >
              {v.ctaSecondary}
            </WhatsAppButton>
          </div>

          {/* Trust line */}
          <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-deep-foreground/60 pt-2">
            <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <span>ICP-Brasil • Processo online • Atendimento humano</span>
          </div>
        </div>
      </div>
    </section>
  );
};
