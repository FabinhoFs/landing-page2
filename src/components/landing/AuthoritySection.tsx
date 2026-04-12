import { Globe, Award, ShieldCheck, Headphones } from "lucide-react";
import { useCtaMessages } from "@/hooks/useCtaMessages";

const proofs = [
  { icon: Globe, label: "Operação online" },
  { icon: Award, label: "Experiência no mercado" },
  { icon: ShieldCheck, label: "Processo estruturado" },
  { icon: Headphones, label: "Atendimento especializado" },
];

export const AuthoritySection = () => {
  const { settings } = useCtaMessages();

  return (
    <section className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
        <h2 className="text-2xl font-bold text-card-foreground md:text-3xl mb-4">
          Agis Digital: atendimento online com praticidade, clareza e suporte especializado
        </h2>

        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          A Agis Digital atua com foco em Certificação Digital, oferecendo um processo online com atendimento humano, validação orientada e suporte para clientes em todo o Brasil.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {proofs.map((p, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-background p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs md:text-sm font-medium text-foreground text-center">{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
