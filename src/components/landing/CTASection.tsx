import { WhatsAppButton } from "./WhatsAppButton";

interface CTASectionProps {
  city: string;
}

export const CTASection = ({ city }: CTASectionProps) => {
  return (
    <section className="bg-card border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold text-foreground md:text-4xl">
          Garanta seu Certificado Digital agora
        </h2>
        <p className="mt-4 mb-8 text-muted-foreground">
          Emissão rápida, segura e sem burocracia em {city}.
        </p>
        <WhatsAppButton
          buttonId="cta_bottom"
          message={`Olá! Quero garantir meu Certificado Digital em ${city}.`}
          className="text-base px-8 py-5"
        >
          Solicitar meu Certificado agora
        </WhatsAppButton>
      </div>
    </section>
  );
};
