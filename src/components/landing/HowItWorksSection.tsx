import { FileText, Upload, Video, Award } from "lucide-react";

const steps = [
  { icon: FileText, title: "Passo 1", desc: "Solicitação" },
  { icon: Upload, title: "Passo 2", desc: "Envio de documentos" },
  { icon: Video, title: "Passo 3", desc: "Videoconferência" },
  { icon: Award, title: "Passo 4", desc: "Emissão do certificado" },
];

export const HowItWorksSection = () => {
  return (
    <section className="bg-card py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold text-card-foreground md:text-4xl mb-12">
          Veja o passo a passo simples para emitir seu certificado
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <step.icon className="h-10 w-10 text-primary" />
              </div>
              <p className="font-bold text-card-foreground">{step.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
