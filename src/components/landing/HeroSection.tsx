import { WhatsAppButton } from "./WhatsAppButton";
import { Shield, Clock, CheckCircle } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

interface HeroSectionProps {
  city: string;
}

export const HeroSection = ({ city }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-deep/95 via-deep/85 to-deep/60" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 md:py-32">
        <div className="max-w-2xl space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm text-secondary-foreground">
            <Shield className="h-4 w-4 text-secondary" />
            <span className="text-white/90">Certificação Digital Oficial</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            Certificado Digital em{" "}
            <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              {city}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg leading-relaxed text-white/80 md:text-xl">
            Emissão rápida, segura e com suporte especializado. Garanta seu
            certificado digital sem complicações em {city}.
          </p>

          {/* Quick benefits */}
          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-secondary" /> Emissão em até 30 min
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-secondary" /> 100% Online
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-secondary" /> ICP-Brasil
            </span>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <WhatsAppButton
              buttonId="cta_hero"
              message={`Olá! Quero emitir meu Certificado Digital em ${city}.`}
              className="text-lg px-8 py-6"
            >
              Emitir meu Certificado agora
            </WhatsAppButton>
          </div>
        </div>
      </div>
    </section>
  );
};
