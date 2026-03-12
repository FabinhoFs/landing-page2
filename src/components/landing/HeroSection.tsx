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
  const { getMessage } = useCtaMessages();
  const heroMsg = getMessage("cta_hero", city);

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

      <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-foreground">
            <Zap className="h-4 w-4" />
            Atendimento imediato
          </div>

          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            Seu Certificado Digital{" "}
            <span className="text-primary">pronto no mesmo dia.</span>
          </h1>

          <p className="text-base md:text-lg text-deep-foreground/80 leading-relaxed max-w-xl mx-auto transition-opacity duration-500 whitespace-normal" style={{ lineHeight: 1.6 }}>
            {detected && city
              ? <>Videoconferência em menos de 5 minutos para você de <span className="font-bold text-primary inline-block px-1">{city}</span> e região. Sem filas e 100% online.</>
              : "Líder em emissão expressa para todo o Brasil. Videoconferência em menos de 5 minutos, sem burocracia e 100% online."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <WhatsAppButton
              buttonId="cta_hero_primary"
              message={heroMsg}
              className="text-base px-8 py-5 font-bold"
            >
              Emitir em 5 minutos
            </WhatsAppButton>
            <WhatsAppButton
              buttonId="cta_hero_secondary"
              message={heroMsg}
              className="text-base px-8 py-5 font-bold bg-transparent border-2 border-deep-foreground/30 text-deep-foreground hover:bg-deep-foreground/10"
            >
              Quero meu certificado agora
            </WhatsAppButton>
          </div>

          <p className="text-sm text-deep-foreground/60">✨ Atendimento imediato via videoconferência</p>

          <div className="flex items-center justify-center gap-2 text-sm text-deep-foreground/60 pt-4">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>Certificação ICP-Brasil • 100% seguro e homologado</span>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {features.map((feat, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 rounded-xl bg-deep-foreground/10 backdrop-blur-sm px-4 py-6 text-sm text-deep-foreground text-center"
            >
              <feat.icon className="h-8 w-8 shrink-0 text-primary" />
              <span>{feat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
