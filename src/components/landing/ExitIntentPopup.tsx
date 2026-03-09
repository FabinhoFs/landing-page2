import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WhatsAppButton } from "./WhatsAppButton";
import { AlertTriangle } from "lucide-react";

interface ExitIntentPopupProps {
  city: string;
}

export const ExitIntentPopup = ({ city }: ExitIntentPopupProps) => {
  const [open, setOpen] = useState(false);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !triggered) {
        setTriggered(true);
        setOpen(true);

        if ((window as any).dataLayer) {
          (window as any).dataLayer.push({ event: "exit_intent_popup" });
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [triggered]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-primary/30 bg-card sm:max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <AlertTriangle className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-card-foreground">
            Aguarde! Não saia ainda.
          </DialogTitle>
          <DialogDescription className="text-center text-base text-muted-foreground">
            Garanta seu Certificado Digital em {city} com{" "}
            <span className="font-bold text-primary">desconto especial</span>{" "}
            exclusivo agora mesmo!
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-center">
          <WhatsAppButton
            buttonId="cta_exit_popup"
            message={`Olá! Vi o desconto especial para Certificado Digital em ${city}. Quero aproveitar!`}
            className="w-full text-lg py-6"
          >
            Quero meu desconto agora!
          </WhatsAppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
