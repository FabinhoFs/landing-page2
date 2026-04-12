import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logAccess } from "@/lib/logAccess";
import { logError } from "@/lib/logError";
import { useWhatsAppNumber } from "@/hooks/useWhatsAppNumber";

interface WhatsAppButtonProps {
  buttonId: string;
  message?: string;
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
  onBeforeNavigate?: () => void;
}

export const WhatsAppButton = ({
  buttonId,
  message = "Olá! Quero emitir meu Certificado Digital.",
  children,
  className = "",
  size = "lg",
  onBeforeNavigate,
}: WhatsAppButtonProps) => {
  const phone = useWhatsAppNumber();

  const handleClick = async () => {
    try {
      if (typeof window !== "undefined" && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: "conversion_whatsapp",
          button_id: buttonId,
        });
      }
    } catch (err) {
      logError("WhatsAppButton", "Falha ao disparar evento de conversão", {
        buttonId,
        error: String(err),
      });
    }

    onBeforeNavigate?.();
    logAccess(buttonId);

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  return (
    <Button
      onClick={handleClick}
      size={size}
      className={`bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 font-bold shadow-lg ${className}`}
    >
      <MessageCircle className="mr-2 h-5 w-5" />
      {children}
    </Button>
  );
};
