import { Globe, Award, ShieldCheck, Headphones } from "lucide-react";
import { useCtaMessages } from "@/hooks/useCtaMessages";

const DEFAULT_PROOFS = ["Operação online", "Experiência no mercado", "Processo estruturado", "Atendimento especializado"];
const PROOF_ICONS = [Globe, Award, ShieldCheck, Headphones];

export const AuthoritySection = () => {
  const { settings } = useCtaMessages();

  const title = settings.authority_title || "Agis Digital: atendimento online com praticidade, clareza e suporte especializado";
  const subtitle = settings.authority_subtitle || "A Agis Digital atua com foco em Certificação Digital, oferecendo um processo online com atendimento humano, validação orientada e suporte para clientes em todo o Brasil.";

  // Read from structured fields first, then JSON fallback
  const proofs: string[] = [];
  for (let i = 1; i <= 8; i++) {
    const val = settings[`authority_card_${i}`];
    if (val !== undefined && val !== "") proofs.push(val);
  }
  if (proofs.length === 0) {
    if (settings.authority_proofs) {
      try {
        const parsed = JSON.parse(settings.authority_proofs);
        proofs.push(...parsed.map((p: any) => p.label || p));
      } catch {}
    }
    if (proofs.length === 0) proofs.push(...DEFAULT_PROOFS);
  }

  return (
    <section className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
        <h2 className="text-2xl font-bold text-card-foreground md:text-3xl mb-4">{title}</h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">{subtitle}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {proofs.map((label, i) => {
            const Icon = PROOF_ICONS[i % PROOF_ICONS.length];
            return (
              <div key={i} className="flex flex-col items-center gap-3 rounded-xl border border-border bg-background p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs md:text-sm font-medium text-foreground text-center">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
