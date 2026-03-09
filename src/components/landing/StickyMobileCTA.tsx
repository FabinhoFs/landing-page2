import { WhatsAppButton } from "./WhatsAppButton";

export const StickyMobileCTA = ({ city }: { city: string }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-deep/95 backdrop-blur-md p-3 md:hidden border-t border-deep-foreground/10">
      <WhatsAppButton
        buttonId="cta_sticky_mobile"
        message={`Olá! Quero emitir meu Certificado Digital em ${city}.`}
        className="w-full text-base py-4 font-bold"
      >
        Emitir Certificado Agora
      </WhatsAppButton>
    </div>
  );
};
