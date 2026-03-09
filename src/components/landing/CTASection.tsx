import { WhatsAppButton } from "./WhatsAppButton";
import { Shield } from "lucide-react";

interface CTASectionProps {
  city: string;
}

export const CTASection = ({ city }: CTASectionProps) => {
  return (
    <section className="bg-deep py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Shield className="mx-auto mb-6 h-12 w-12 text-secondary" />
        <h2 className="mb-4 text-3xl font-bold text-deep-foreground md:text-4xl">
          Garanta seu Certificado Digital em {city} agora
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-deep-foreground/70">
          Emissão rápida, segura e sem burocracia. Atendimento especializado
          para você e sua empresa.
        </p>
        <WhatsAppButton
          buttonId="cta_bottom"
          message={`Olá! Quero garantir meu Certificado Digital em ${city}.`}
          className="text-lg px-10 py-6"
        >
          Solicitar meu Certificado agora
        </WhatsAppButton>
      </div>
    </section>
  );
};
