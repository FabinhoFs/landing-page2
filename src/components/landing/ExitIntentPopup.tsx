import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WhatsAppButton } from "./WhatsAppButton";
import { Gift, Timer, Headphones } from "lucide-react";
import { useCtaMessages } from "@/hooks/useCtaMessages";

interface ExitIntentPopupProps {
  city: string;
}

export const ExitIntentPopup = ({ city }: ExitIntentPopupProps) => {
  const [open, setOpen] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const { settings, getMessage } = useCtaMessages();

  const popupEnabled = settings.popup_enabled === "true";
  const discount = settings.popup_discount || "20";
  const title = settings.popup_title || "ESPERA! NÃO VÁ EMBORA.";
  const subtitle = settings.popup_subtitle || "Garanta um desconto exclusivo para emitir seu Certificado Digital agora.";
  const supportText = settings.support_text || "Suporte completo e humanizado: em caso de qualquer dúvida, conte conosco do início ao fim.";

  const trigger = useCallback(() => {
    if (triggered || !popupEnabled) return;
    setTriggered(true);
    setOpen(true);
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({ event: "exit_intent_popup", city });
    }
  }, [triggered, popupEnabled, city]);

  useEffect(() => {
    if (!popupEnabled) return;

    // Desktop: mouse leave
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    // Mobile: inactivity timer (20s)
    let inactivityTimer = setTimeout(() => trigger(), 20000);
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => trigger(), 20000);
    };
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    // Mobile: rapid scroll up
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const delta = lastScrollY - window.scrollY;
      if (delta > 200 && window.scrollY < 300) trigger();
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(inactivityTimer);
    };
  }, [popupEnabled, trigger]);

  // Don't render anything if disabled
  if (!popupEnabled) return null;

  const ctaMessage = (getMessage("cta_exit_popup", city) || `Olá! Vi o desconto de R$ ${discount},00 na página e quero aproveitar para emitir meu certificado.`)
    .replace(/\{valor\}/g, discount);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-primary/30 bg-card sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
            <Gift className="h-10 w-10 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-extrabold text-card-foreground">
            🔥 {title}
          </DialogTitle>
          <DialogDescription className="text-center text-base text-muted-foreground">
            {subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">Ganhe agora</p>
          <p className="text-5xl font-black text-primary">R$ {discount},00</p>
          <p className="mt-1 text-sm text-muted-foreground">de desconto no seu Certificado Digital</p>
          <div className="mt-3 flex items-center justify-center gap-1 text-xs text-destructive font-semibold">
            <Timer className="h-3 w-3" /> Válido apenas agora
          </div>
        </div>

        <WhatsAppButton
          buttonId="cta_exit_popup"
          message={ctaMessage}
          className="w-full text-lg py-6"
        >
          Garantir meu desconto agora!
        </WhatsAppButton>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-2">
          <Headphones className="h-3.5 w-3.5 text-primary" />
          <span>{supportText}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
