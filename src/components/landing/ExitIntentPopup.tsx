import { useEffect, useState, useCallback, useRef } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";

interface ExitIntentPopupProps {
  city: string;
}

const SESSION_KEY = "exit_intent_shown";

export const ExitIntentPopup = ({ city }: ExitIntentPopupProps) => {
  const [open, setOpen] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const { settings, getMessage } = useCtaMessages();
  const isMobile = useIsMobile();
  const scrollRef = useRef({ lastY: 0, lastTime: 0 });
  const backStateRef = useRef(false);

  const popupEnabled = settings.popup_enabled !== "false";
  const triggerDesktop = settings.popup_trigger_desktop !== "false";
  const triggerMobileScroll = settings.popup_trigger_mobile_scroll !== "false";
  const triggerMobileBack = settings.popup_trigger_mobile_back === "true";
  const discount = settings.popup_discount_value || settings.popup_discount || "20";
  const title = settings.popup_title || "ESPERA! NÃO VÁ EMBORA.";
  const subtitle = settings.popup_subtitle || "Garanta um desconto exclusivo para emitir seu Certificado Digital agora.";
  const supportText = settings.support_text || "Suporte completo e humanizado: em caso de qualquer dúvida, conte conosco do início ao fim.";
  const ctaButtonText = settings.popup_cta_text || "Quero falar no WhatsApp";

  const alreadyShown = typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1";

  const trigger = useCallback(() => {
    if (triggered || !popupEnabled || alreadyShown) return;
    setTriggered(true);
    setOpen(true);
    sessionStorage.setItem(SESSION_KEY, "1");
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({ event: "exit_intent_popup", city });
    }
  }, [triggered, popupEnabled, alreadyShown, city]);

  useEffect(() => {
    if (!popupEnabled || alreadyShown) return;

    const cleanups: (() => void)[] = [];

    // Desktop: mouse leaves top of viewport
    if (!isMobile && triggerDesktop) {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) trigger();
      };
      document.addEventListener("mouseleave", handleMouseLeave);
      cleanups.push(() => document.removeEventListener("mouseleave", handleMouseLeave));
    }

    // Mobile: fast scroll up detection
    if (isMobile && triggerMobileScroll) {
      scrollRef.current = { lastY: window.scrollY, lastTime: Date.now() };
      const handleScroll = () => {
        const now = Date.now();
        const currentY = window.scrollY;
        const deltaY = scrollRef.current.lastY - currentY;
        const deltaTime = now - scrollRef.current.lastTime;

        if (deltaY > 150 && deltaTime < 200 && currentY < 400) {
          trigger();
        }

        scrollRef.current = { lastY: currentY, lastTime: now };
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", handleScroll));
    }

    // Mobile: back button interception
    if (isMobile && triggerMobileBack && !backStateRef.current) {
      backStateRef.current = true;
      window.history.pushState({ exitIntent: true }, "");
      const handlePopState = (e: PopStateEvent) => {
        if (e.state?.exitIntent) return;
        trigger();
        // Re-push state so user can still navigate back after dismissal
        if (!sessionStorage.getItem(SESSION_KEY)) {
          window.history.pushState({ exitIntent: true }, "");
        }
      };
      window.addEventListener("popstate", handlePopState);
      cleanups.push(() => window.removeEventListener("popstate", handlePopState));
    }

    // Inactivity timer (20s)
    let inactivityTimer = setTimeout(() => trigger(), 20000);
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => trigger(), 20000);
    };
    window.addEventListener("scroll", resetTimer, { passive: true });
    window.addEventListener("touchstart", resetTimer, { passive: true });
    cleanups.push(() => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    });

    return () => cleanups.forEach((fn) => fn());
  }, [popupEnabled, trigger, isMobile, triggerDesktop, triggerMobileScroll, triggerMobileBack, alreadyShown]);

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
          {ctaButtonText}
        </WhatsAppButton>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-2">
          <Headphones className="h-3.5 w-3.5 text-primary" />
          <span>{supportText}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
