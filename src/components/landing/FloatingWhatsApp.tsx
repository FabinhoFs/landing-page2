import { MessageCircle } from "lucide-react";
import { logAccess } from "@/lib/logAccess";
import { useWhatsAppNumber } from "@/hooks/useWhatsAppNumber";

export const FloatingWhatsApp = () => {
  const phone = useWhatsAppNumber();

  const handleClick = () => {
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "conversion_whatsapp",
        button_id: "cta_floating",
      });
    }

    logAccess("cta_floating");

    const msg = encodeURIComponent("Olá! Quero emitir meu Certificado Digital. (origem: cta_floating)");
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-2xl transition-transform hover:scale-110 animate-pulse md:bottom-8 md:right-8"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="h-8 w-8" />
    </button>
  );
};
