import { MessageCircle } from "lucide-react";
import { logAccess } from "@/lib/logAccess";
import { useWhatsAppNumber } from "@/hooks/useWhatsAppNumber";
import { useCtaMessages } from "@/hooks/useCtaMessages";

export const FloatingWhatsApp = () => {
  const phone = useWhatsAppNumber();
  const { settings, getMessage } = useCtaMessages();

  const enabled = settings.floating_whatsapp_enabled !== "false";

  const handleClick = () => {
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "conversion_whatsapp",
        button_id: "cta_floating",
      });
    }

    logAccess("cta_floating");

    const msg = encodeURIComponent(getMessage("cta_floating"));
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  if (!enabled) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-2xl transition-transform hover:scale-110 animate-pulse md:bottom-8 md:right-8 md:h-16 md:w-16"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="h-7 w-7 md:h-8 md:w-8" />
    </button>
  );
};
