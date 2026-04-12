import { ListChecks, FileText, Video, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: ListChecks,
    title: "Escolha o certificado ideal",
    desc: "Selecione o e-CPF A1 ou e-CNPJ A1 conforme sua necessidade.",
  },
  {
    icon: FileText,
    title: "Envie os dados e documentos necessários",
    desc: "Nossa equipe orienta o que é preciso para seguir corretamente.",
  },
  {
    icon: Video,
    title: "Faça a validação por videoconferência",
    desc: "A validação acontece online, com segurança e confirmação das informações exigidas.",
  },
  {
    icon: CheckCircle,
    title: "Conclua sua emissão",
    desc: "Após a validação e aprovação do processo, você conclui sua emissão com suporte da nossa equipe.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="bg-deep text-deep-foreground py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold md:text-4xl mb-3">
            Veja como funciona a emissão
          </h2>
          <p className="text-sm md:text-base text-deep-foreground/70">
            Você faz o processo online com orientação em cada etapa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center text-center gap-4 rounded-2xl bg-deep-foreground/5 border border-deep-foreground/10 p-6"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                {i + 1}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 mt-2">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-deep-foreground">{step.title}</h3>
              <p className="text-xs text-deep-foreground/70 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs md:text-sm text-deep-foreground/60 italic">
          O processo é realizado pelo titular ou responsável pelo certificado, com orientação especializada do início ao fim.
        </p>
      </div>
    </section>
  );
};
