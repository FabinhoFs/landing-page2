import { AlertTriangle, FileX, Clock, Ban, ShieldOff, Users } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { useCtaMessages } from "@/hooks/useCtaMessages";

const DEFAULT_PAINS = [
  "Você não consegue emitir nota fiscal",
  "Fica sem acesso a sistemas oficiais",
  "Atrasa obrigações fiscais e operacionais",
  "Não consegue assinar documentos com validade",
  "Perde tempo com burocracia e atendimento lento",
  "Fica dependente de terceiros para resolver algo urgente",
];

const PAIN_ICONS = [FileX, Ban, Clock, ShieldOff, AlertTriangle, Users];

export const PainSection = () => {
  const { settings, getMessage } = useCtaMessages();

  const title = settings.pain_title || "Ficar sem Certificado Digital atrasa o que você precisa resolver hoje.";
  const subtitle = settings.pain_subtitle || "Resolva isso com um processo online, validado e acompanhado por atendimento especializado.";
  const ctaText = settings.pain_cta || "Quero falar no WhatsApp";

  // Read from structured fields first, then JSON fallback
  const pains: string[] = [];
  for (let i = 1; i <= 10; i++) {
    const val = settings[`pain_item_${i}`];
    if (val !== undefined && val !== "") pains.push(val);
  }
  if (pains.length === 0) {
    if (settings.pain_items) {
      try { pains.push(...JSON.parse(settings.pain_items)); } catch {}
    }
    if (pains.length === 0) pains.push(...DEFAULT_PAINS);
  }

  return (
    <section className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
        <h2 className="text-2xl font-bold text-card-foreground md:text-4xl mb-4">{title}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-10 max-w-3xl mx-auto text-left">
          {pains.map((text, i) => {
            const Icon = PAIN_ICONS[i % PAIN_ICONS.length];
            return (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <Icon className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <span className="text-sm text-card-foreground">{text}</span>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">{subtitle}</p>

        <div className="mt-6">
          <WhatsAppButton buttonId="cta_pain" message={getMessage("cta_hero")} className="text-base px-8 py-4 font-bold">
            {ctaText}
          </WhatsAppButton>
        </div>
      </div>
    </section>
  );
};
