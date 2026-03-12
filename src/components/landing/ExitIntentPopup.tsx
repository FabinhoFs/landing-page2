import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WhatsAppButton } from "./WhatsAppButton";
import { Gift, Timer } from "lucide-react";
import { useCtaMessages } from "@/hooks/useCtaMessages";

interface ExitIntentPopupProps {
  city: string;
}

export const ExitIntentPopup = ({ city }: ExitIntentPopupProps) => {
  const [open, setOpen] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const { getMessage } = useCtaMessages();

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !triggered) {
        setTriggered(true);
        setOpen(true);

        if ((window as any).dataLayer) {
          (window as any).dataLayer.push({
            event: "exit_intent_popup",
            city,
          });
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [triggered, city]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-primary/30 bg-card sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
            <Gift className="h-10 w-10 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-extrabold text-card-foreground">
            🔥 Espere! Oferta exclusiva!
          </DialogTitle>
          <DialogDescription className="text-center text-base text-muted-foreground">
            Só para você que está em{" "}
            <span className="font-bold text-foreground">{city}</span>:
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">Desconto especial</p>
          <p className="text-4xl font-black text-primary">20% OFF</p>
          <p className="mt-1 text-sm text-muted-foreground">no seu Certificado Digital</p>
          <div className="mt-3 flex items-center justify-center gap-1 text-xs text-destructive font-semibold">
            <Timer className="h-3 w-3" /> Válido apenas agora
          </div>
        </div>

        <WhatsAppButton
          buttonId="cta_exit_popup"
          message={getMessage("cta_exit_popup", city)}
          className="w-full text-lg py-6"
        >
          Garantir meu desconto agora!
        </WhatsAppButton>

        <p className="text-center text-xs text-muted-foreground mt-2">
          Sem compromisso. Fale com um especialista.
        </p>
      </DialogContent>
    </Dialog>
  );
};
