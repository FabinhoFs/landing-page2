import { WhatsAppButton } from "./WhatsAppButton";
import { Smartphone, CheckCircle, Lock, Video, Clock } from "lucide-react";
import heroPerson from "@/assets/hero-person.png";
import agisLogo from "@/assets/agis-logo.png";

interface HeroSectionProps {
  city: string;
}

const features = [
  { icon: Smartphone, label: "Através do celular ou notebook" },
  { icon: CheckCircle, label: "Sem burocracia" },
  { icon: Lock, label: "Seguro" },
  { icon: Video, label: "Validação por vídeo conferência" },
  { icon: Clock, label: "Sem perder tempo" },
];

export const HeroSection = ({ city }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex flex-col overflow-hidden bg-gradient-to-br from-deep via-primary to-secondary">
      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--secondary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left column */}
            <div className="space-y-8">
              {/* Logo */}
              <img src={agisLogo} alt="Agis Digital" className="h-20 md:h-24 w-auto brightness-0 invert" />

              {/* Headline */}
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
                Seu Certificado Digital pronto no mesmo dia
              </h1>

              {/* CTA */}
              <WhatsAppButton
                buttonId="cta_hero"
                message={`Olá! Quero emitir meu Certificado Digital em ${city}.`}
                className="text-lg px-10 py-6 rounded-full uppercase tracking-wider bg-secondary text-secondary-foreground hover:bg-secondary/90 border-2 border-secondary-foreground/20"
              >
                Quero meu Certificado
              </WhatsAppButton>
            </div>

            {/* Right column - Person */}
            <div className="hidden md:flex justify-center items-end">
              <img
                src={heroPerson}
                alt="Profissional com laptop"
                className="max-h-[500px] lg:max-h-[560px] object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom features bar */}
      <div className="relative z-10 pb-8 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {features.map((feat, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-xl border border-primary-foreground/20 bg-primary-foreground/5 backdrop-blur-sm px-4 py-5 text-center"
              >
                <feat.icon className="h-7 w-7 text-primary-foreground" />
                <span className="text-xs md:text-sm font-medium text-primary-foreground/90 leading-tight">
                  {feat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
