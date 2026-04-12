import { ShieldCheck, Zap, Users, Headphones } from "lucide-react";
import { useCtaMessages } from "@/hooks/useCtaMessages";
import { getIconComponent } from "@/components/admin/IconPicker";

const DEFAULT_ITEMS = [
  { icon: "ShieldCheck", text: "Emissão oficial ICP-Brasil" },
  { icon: "Zap", text: "Rapidez e Segurança" },
  { icon: "Users", text: "Junte-se a quem confia em nossa emissão oficial." },
  { icon: "Headphones", text: "Suporte completo e humanizado: em caso de qualquer dúvida, conte conosco do início ao fim." },
];

export const SocialProofBar = () => {
  const { settings } = useCtaMessages();

  let items = DEFAULT_ITEMS;
  if (settings.social_proof_items) {
    try {
      const parsed = JSON.parse(settings.social_proof_items);
      if (Array.isArray(parsed) && parsed.length > 0) {
        items = parsed;
      }
    } catch {}
  }

  return (
    <section className="relative bg-deep text-deep-foreground overflow-hidden py-10 md:py-14">
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 70% 50%, hsl(276 55% 33% / 0.10) 0%, transparent 60%)"
      }} />
      <div className="relative mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {items.map((item, i) => {
            const Icon = getIconComponent(item.icon) || ShieldCheck;
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-3 rounded-2xl border border-deep-foreground/10 bg-deep-foreground/5 p-5 md:p-6 text-center backdrop-blur-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs md:text-sm font-medium leading-snug text-deep-foreground/90">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
