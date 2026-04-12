import { Zap, Headphones, Video, ShieldCheck } from "lucide-react";
import { useCtaMessages } from "@/hooks/useCtaMessages";

const DEFAULT_BENEFITS = [
  { title: "Atendimento imediato", desc: "Você fala com uma equipe preparada para orientar seu processo com mais agilidade." },
  { title: "Suporte do início ao fim", desc: "Nossa equipe acompanha cada etapa para reduzir dúvidas, erro e retrabalho." },
  { title: "Validação online com praticidade", desc: "Você realiza a validação por videoconferência, com mais comodidade e segurança." },
  { title: "Processo seguro e homologado", desc: "A emissão segue um fluxo estruturado, com foco em conformidade, segurança e clareza." },
];

const BENEFIT_ICONS = [Zap, Headphones, Video, ShieldCheck];

export const BenefitsSection = () => {
  const { settings } = useCtaMessages();

  const title = settings.benefits_title || "Por que emitir com a Agis Digital";

  let benefits = DEFAULT_BENEFITS;
  if (settings.benefits_items) {
    try { benefits = JSON.parse(settings.benefits_items); } catch { /* use default */ }
  }

  return (
    <section className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <h2 className="text-center text-2xl font-bold text-card-foreground md:text-4xl mb-10 md:mb-14">
          {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {benefits.map((b, i) => {
            const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
            return (
              <div
                key={i}
                className="flex gap-4 rounded-2xl border border-border bg-background p-6 md:p-8"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-foreground">{b.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
