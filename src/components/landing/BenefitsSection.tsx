import { Zap, Shield, Phone, Lock, FastForward, HeadphonesIcon, ShieldCheck } from "lucide-react";
import benefitsHero from "@/assets/benefits-hero.jpg";

const benefits = [
  {
    icon: FastForward,
    title: "Velocidade",
    desc: "Com facilidade e comodismo, você pode emitir seu Certificado Digital com velocidade em tempo recorde através do nosso atendimento.",
  },
  {
    icon: ShieldCheck,
    title: "Confiança",
    desc: "Somos uma Autoridade de Registro com vasta experiência de mais de 5 anos no mercado e centenas de profissionais satisfeitos com a emissão de seus Certificados.",
  },
  {
    icon: HeadphonesIcon,
    title: "Atendimento Personalizado",
    desc: "Temos pessoas preparadas a todo vapor para te atender da forma mais simples possível com cordialidade e compromisso com o seu objetivo.",
  },
  {
    icon: Lock,
    title: "Segurança",
    desc: "Emitir seu Certificado com a Agis é garantia de segurança, nós somos devidamente credenciados pelo Instituto Nacional de tecnologia da Informação (ITI), oferecendo soluções completas em Certificação Digital.",
  },
];

export const BenefitsSection = () => {
  return (
    <section className="bg-deep text-deep-foreground py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-xl bg-deep-foreground/5 border border-deep-foreground/10 p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary">{b.title}</h3>
                  <p className="text-sm text-deep-foreground/70 mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:flex justify-center">
            <img
              src={benefitsHero}
              alt="Segurança digital biometria"
              className="max-h-[500px] object-contain rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
