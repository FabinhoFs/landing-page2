import step1 from "@/assets/step-1-solicitacao.jpg";
import step2 from "@/assets/step-2-documentos.jpg";
import step3 from "@/assets/step-3-videoconferencia.jpg";
import step4 from "@/assets/step-4-emissao.jpg";

const steps = [
  { img: step1, title: "Passo 1", desc: "Solicitação" },
  { img: step2, title: "Passo 2", desc: "Envio de documentos" },
  { img: step3, title: "Passo 3", desc: "Videoconferência" },
  { img: step4, title: "Passo 4", desc: "Emissão do certificado" },
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
            <div key={i} className="rounded-xl overflow-hidden bg-deep shadow-md">
              <div className="bg-primary px-4 py-3">
                <p className="font-bold text-primary-foreground text-lg">{step.title}</p>
              </div>
              <div className="aspect-square overflow-hidden">
                <img
                  src={step.img}
                  alt={step.desc}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="px-4 py-3 flex items-center gap-2">
                <span className="text-primary">▼</span>
                <p className="text-sm font-medium text-deep-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
