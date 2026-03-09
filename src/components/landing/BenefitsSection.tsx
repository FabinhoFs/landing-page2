import { Zap, Shield, Phone, Monitor } from "lucide-react";
import heroPerson from "@/assets/hero-person.png";

const benefits = [
  {
    icon: Zap,
    title: "Velocidade",
    desc: "Com facilidade e comodismo, você pode emitir seu Certificado Digital com velocidade em tempo recorde através do nosso atendimento.",
  },
  {
    icon: Shield,
    title: "Confiança",
    desc: "Somos uma Autoridade de Registro com vasta experiência de mais de 5 anos no mercado e centenas de profissionais satisfeitos.",
  },
  {
    icon: Phone,
    title: "Atendimento Personalizado",
    desc: "Temos pessoas preparadas a todo vapor para te atender da forma mais simples possível com cordialidade e compromisso.",
  },
  {
    icon: Monitor,
    title: "Segurança",
    desc: "Emitir seu Certificado com a Agis é garantia de segurança, nós somos devidamente credenciados pelo ITI, oferecendo soluções completas.",
  },
];

export const BenefitsSection = () => {
  return (
    <section className="bg-deep text-deep-foreground py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {benefits.map((b, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{b.title}</h3>
                  <p className="text-sm text-deep-foreground/70 mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:flex justify-center">
            <img
              src={heroPerson}
              alt="Profissional com laptop"
              className="max-h-[400px] object-contain rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
