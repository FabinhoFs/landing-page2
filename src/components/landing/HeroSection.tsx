import { WhatsAppButton } from "./WhatsAppButton";
import { Smartphone, CheckCircle, Lock, Video, Clock, Zap } from "lucide-react";
import heroPerson from "@/assets/hero-person.png";

interface HeroSectionProps {
  city: string;
}

const features = [
  { icon: Smartphone, label: "Através do celular ou notebook" },
  { icon: CheckCircle, label: "Sem burocracia" },
  { icon: Lock, label: "Seguro" },
  { icon: Video, label: "Validação por videoconferência" },
  { icon: Clock, label: "Sem perder tempo" },
];

export const HeroSection = ({ city }: HeroSectionProps) => {
  return (
    <section className="relative bg-deep text-deep-foreground overflow-hidden pt-20">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, hsl(276 55% 33% / 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(276 48% 44% / 0.3) 0%, transparent 50%)"
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-foreground">
              <Zap className="h-4 w-4" />
              Atendimento imediato
            </div>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
              Seu Certificado Digital pronto no mesmo dia.
            </h1>
            <p className="text-lg text-deep-foreground/80 leading-relaxed max-w-lg">
              Emita seu e-CPF ou e-CNPJ de forma rápida, segura e totalmente online em {city}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <WhatsAppButton
                buttonId="cta_hero_primary"
                message={`Olá! Quero emitir meu Certificado Digital em ${city}.`}
                className="text-base px-8 py-5 font-bold"
              >
                Emitir Certificado Agora
              </WhatsAppButton>
              <WhatsAppButton
                buttonId="cta_hero_secondary"
                message={`Olá! Quero falar sobre Certificado Digital em ${city}.`}
                className="text-base px-8 py-5 font-bold bg-transparent border-2 border-deep-foreground/30 text-deep-foreground hover:bg-deep-foreground/10"
              >
                Falar no WhatsApp
              </WhatsAppButton>
            </div>
          </div>

          {/* Right */}
          <div className="hidden md:flex justify-center">
            <img
              src={heroPerson}
              alt="Profissional com laptop"
              className="max-h-[420px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {features.map((feat, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-deep-foreground/10 backdrop-blur-sm px-4 py-3 text-sm text-deep-foreground"
            >
              <feat.icon className="h-5 w-5 shrink-0 text-primary" />
              <span>{feat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
