import { WhatsAppButton } from "./WhatsAppButton";
import { Smartphone, CheckCircle, Lock, Video, Clock } from "lucide-react";
import agisLogo from "@/assets/agis-logo.png";
import heroPerson from "@/assets/hero-person.png";

interface HeroSectionProps {
  city: string;
}

const features = [
  { icon: Smartphone, label: "Celular ou notebook" },
  { icon: CheckCircle, label: "Sem burocracia" },
  { icon: Lock, label: "Seguro" },
  { icon: Video, label: "Videoconferência" },
  { icon: Clock, label: "Sem perder tempo" },
];

export const HeroSection = ({ city }: HeroSectionProps) => {
  return (
    <section className="bg-background border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        {/* Logo */}
        <div className="mb-10">
          <img src={agisLogo} alt="Agis Digital" className="h-14 w-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
              Seu Certificado Digital pronto no mesmo dia
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Emissão rápida, segura e com suporte especializado em {city}.
            </p>
            <WhatsAppButton
              buttonId="cta_hero"
              message={`Olá! Quero emitir meu Certificado Digital em ${city}.`}
              className="text-base px-8 py-5"
            >
              Quero meu Certificado
            </WhatsAppButton>
          </div>

          {/* Right */}
          <div className="hidden md:flex justify-center">
            <img
              src={heroPerson}
              alt="Profissional com laptop"
              className="max-h-[420px] object-contain"
            />
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {features.map((feat, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-card-foreground"
            >
              <feat.icon className="h-4 w-4 shrink-0 text-primary" />
              <span>{feat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
