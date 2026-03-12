import { WhatsAppButton } from "./WhatsAppButton";
import { useCtaMessages } from "@/hooks/useCtaMessages";

interface CTASectionProps {
  city: string;
}

export const CTASection = ({ city }: CTASectionProps) => {
  const { getMessage } = useCtaMessages();

  return (
    <section className="bg-deep text-deep-foreground py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          Pronto para emitir seu certificado digital?
        </h2>
        <p className="mt-4 mb-8 text-deep-foreground/70">
          Nos chame no chat que iremos te ajudar!
        </p>
        <WhatsAppButton
          buttonId="cta_bottom"
          message={getMessage("cta_bottom", city)}
          className="text-base px-8 py-5 font-bold"
        >
          FALE CONOSCO
        </WhatsAppButton>
      </div>
    </section>
  );
};
