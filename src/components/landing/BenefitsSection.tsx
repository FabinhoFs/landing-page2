import { Zap, Headphones, Video, ShieldCheck } from "lucide-react";
import { useCtaMessages } from "@/hooks/useCtaMessages";
import { getLandingIcon } from "@/lib/iconMap";

const DEFAULT_BENEFITS = [
  { title: "Atendimento imediato", desc: "Você fala com uma equipe preparada para orientar seu processo com mais agilidade.", icon: "FastForward" },
  { title: "Suporte do início ao fim", desc: "Nossa equipe acompanha cada etapa para reduzir dúvidas, erro e retrabalho.", icon: "ShieldCheck" },
  { title: "Validação online com praticidade", desc: "Você realiza a validação por videoconferência, com mais comodidade e segurança.", icon: "Headphones" },
  { title: "Processo seguro e homologado", desc: "A emissão segue um fluxo estruturado, com foco em conformidade, segurança e clareza.", icon: "Lock" },
];

const FALLBACK_ICONS = [Zap, Headphones, Video, ShieldCheck] as const;

export const BenefitsSection = () => {
  const { settings } = useCtaMessages();

  const title = settings.benefits_title || "Por que emitir com a Agis Digital";

  // Support both JSON array format AND individual benefit_N fields from AdminDiferenciais
  let benefits = DEFAULT_BENEFITS;

  if (settings.benefits_items) {
    try { benefits = JSON.parse(settings.benefits_items); } catch { /* use fallback */ }
  } else if (settings.benefit_1_title) {
    // Read from individual fields saved by AdminDiferenciais
    benefits = [1, 2, 3, 4].map((n, i) => ({
      title: settings[`benefit_${n}_title`] || DEFAULT_BENEFITS[i]?.title || "",
      desc: settings[`benefit_${n}_desc`] || DEFAULT_BENEFITS[i]?.desc || "",
      icon: settings[`diff_${n}_icon`] || DEFAULT_BENEFITS[i]?.icon || "Zap",
    })).filter(b => b.title);
  }

  return (
    <section className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <h2 className="text-center text-2xl font-bold text-card-foreground md:text-4xl mb-10 md:mb-14">
          {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {benefits.map((b: any, i: number) => {
            const Icon = (b.icon && getLandingIcon(b.icon)) || FALLBACK_ICONS[i % FALLBACK_ICONS.length];
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
