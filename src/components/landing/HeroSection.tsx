import { WhatsAppButton } from "./WhatsAppButton";
import { Smartphone, CheckCircle, Lock, Video, Clock, Zap, Shield, KeyRound, ShieldCheck, Fingerprint } from "lucide-react";
import { useCtaMessages } from "@/hooks/useCtaMessages";

interface HeroSectionProps {
  city: string | null;
  detected: boolean;
}

const features = [
  { icon: Smartphone, label: "Através do celular ou notebook" },
  { icon: CheckCircle, label: "Sem burocracia" },
  { icon: Lock, label: "Seguro" },
  { icon: Video, label: "Validação por videoconferência" },
  { icon: Clock, label: "Sem perder tempo" },
];

export const HeroSection = ({ city, detected }: HeroSectionProps) => {
  const { settings, getMessage } = useCtaMessages();
  const heroMsg = getMessage("cta_hero", city);

  const title = settings.hero_title || "Seu Certificado Digital";
  const highlight = settings.hero_highlight || "pronto no mesmo dia.";
  const subtitleDetected = settings.hero_subtitle_detected || "Videoconferência em menos de 5 minutos para você de {cidade} e região. Sem filas e 100% online.";
  const subtitleFallback = settings.hero_subtitle_fallback || "Emissão de certificados com validade jurídica e atendimento simplificado em todo o território nacional.";
  const btnPrimary = settings.hero_button_primary || "Emitir em 5 minutos";
  const btnSecondary = settings.hero_button_secondary || "Quero meu certificado agora";
  const microText = settings.hero_micro_text || "✨ Atendimento imediato via videoconferência";

  const subtitle = detected && city
    ? subtitleDetected.replace(/\{cidade\}/g, city)
    : subtitleFallback;

  return (
    <section className="relative bg-deep text-deep-foreground overflow-hidden pt-20">
      <div className="absolute inset-0 overflow-hidden">
        <Shield className="absolute top-[15%] right-[10%] h-24 w-24 text-primary/[0.07] rotate-12" />
        <Lock className="absolute top-[60%] right-[20%] h-16 w-16 text-primary/[0.06] -rotate-12" />
        <KeyRound className="absolute top-[30%] left-[5%] h-20 w-20 text-primary/[0.05] rotate-6" />
        <ShieldCheck className="absolute bottom-[20%] right-[8%] h-28 w-28 text-primary/[0.06] -rotate-6" />
        <Fingerprint className="absolute top-[10%] left-[40%] h-20 w-20 text-primary/[0.05] rotate-45" />
        <Lock className="absolute bottom-[30%] left-[15%] h-14 w-14 text-primary/[0.07] rotate-12" />
        <Shield className="absolute top-[50%] left-[50%] h-32 w-32 text-primary/[0.04]" />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 30% 50%, hsl(276 55% 33% / 0.15) 0%, transparent 60%)"
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-foreground">
            <Zap className="h-4 w-4" />
            Atendimento imediato
          </div>

          <h1 className="text-3xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            {title}{" "}
            <span className="text-primary">{highlight}</span>
          </h1>

          <p className="text-sm md:text-lg text-deep-foreground/80 leading-relaxed max-w-xl mx-auto">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <WhatsAppButton
              buttonId="cta_hero_primary"
              message={heroMsg}
              className="text-base px-6 md:px-8 py-4 md:py-5 font-bold"
            >
              {btnPrimary}
            </WhatsAppButton>
            <WhatsAppButton
              buttonId="cta_hero_secondary"
              message={heroMsg}
              className="text-base px-6 md:px-8 py-4 md:py-5 font-bold bg-transparent border-2 border-deep-foreground/30 text-deep-foreground hover:bg-deep-foreground/10"
            >
              {btnSecondary}
            </WhatsAppButton>
          </div>

          <p className="text-xs md:text-sm text-deep-foreground/60">{microText}</p>

          <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-deep-foreground/60 pt-2 md:pt-4">
            <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <span>Certificação ICP-Brasil • 100% seguro e homologado</span>
          </div>
        </div>

        <div className="mt-12 md:mt-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
          {features.map((feat, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 md:gap-3 rounded-xl bg-deep-foreground/10 backdrop-blur-sm px-3 md:px-4 py-4 md:py-6 text-xs md:text-sm text-deep-foreground text-center"
            >
              <feat.icon className="h-6 w-6 md:h-8 md:w-8 shrink-0 text-primary" />
              <span>{feat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
