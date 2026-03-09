import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  buttonId: string;
  message?: string;
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
  phone?: string;
}

const WHATSAPP_NUMBER = "5524999999999"; // Substituir pelo número real

export const WhatsAppButton = ({
  buttonId,
  message = "Olá! Quero emitir meu Certificado Digital.",
  children,
  className = "",
  size = "lg",
  phone,
}: WhatsAppButtonProps) => {
  const handleClick = () => {
    // DataLayer event for GTM
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "conversion_whatsapp",
        button_id: buttonId,
      });
    }

    const encodedMessage = encodeURIComponent(`${message} (origem: ${buttonId})`);
    const number = phone || WHATSAPP_NUMBER;
    window.open(`https://wa.me/${number}?text=${encodedMessage}`, "_blank");
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
