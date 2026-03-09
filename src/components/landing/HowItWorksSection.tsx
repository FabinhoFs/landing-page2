import { ShoppingCart, FileText, Video, Mail } from "lucide-react";

const steps = [
  {
    icon: ShoppingCart,
    title: "Solicitação",
    description: "Você efetua a compra do certificado digital do modelo desejado.",
  },
  {
    icon: FileText,
    title: "Envio de documentos",
    description: "Envie os documentos necessários de acordo com o certificado escolhido.",
  },
  {
    icon: Video,
    title: "Videoconferência",
    description: "Um Agente de Registro faz seu atendimento em menos de 3 minutos.",
  },
  {
    icon: Mail,
    title: "Emissão do certificado",
    description: "Você recebe um e-mail com as instruções para instalação.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="bg-card py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Passo a passo simples
          </h2>
          <p className="mt-3 text-muted-foreground">
            Veja como é fácil emitir seu certificado digital.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-primary">
                <step.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Passo {i + 1}
              </span>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
