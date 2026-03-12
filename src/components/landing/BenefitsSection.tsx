import { Zap, Lock, FastForward, HeadphonesIcon, ShieldCheck } from "lucide-react";
import benefitsHero from "@/assets/benefits-hero.jpg";
import { useCtaMessages } from "@/hooks/useCtaMessages";

const DEFAULT_BENEFITS = [
  { icon: FastForward, title: "Velocidade", desc: "Com facilidade e comodismo, você pode emitir seu Certificado Digital com velocidade em tempo recorde através do nosso atendimento." },
  { icon: ShieldCheck, title: "Confiança", desc: "Somos uma Autoridade de Registro com vasta experiência de mais de 5 anos no mercado e centenas de profissionais satisfeitos com a emissão de seus Certificados." },
  { icon: HeadphonesIcon, title: "Atendimento Personalizado", desc: "Temos pessoas preparadas a todo vapor para te atender da forma mais simples possível com cordialidade e compromisso com o seu objetivo." },
  { icon: Lock, title: "Segurança", desc: "Emitir seu Certificado com a Agis é garantia de segurança, nós somos devidamente credenciados pelo Instituto Nacional de tecnologia da Informação (ITI), oferecendo soluções completas em Certificação Digital." },
];

const ICONS = [FastForward, ShieldCheck, HeadphonesIcon, Lock];

export const BenefitsSection = () => {
  const { settings } = useCtaMessages();

  const benefits = DEFAULT_BENEFITS.map((b, i) => ({
    icon: ICONS[i],
    title: settings[`benefit_${i + 1}_title`] || b.title,
    desc: settings[`benefit_${i + 1}_desc`] || b.desc,
  }));

  return (
    <section className="bg-deep text-deep-foreground py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="text-center text-2xl font-bold text-deep-foreground md:text-4xl mb-10 md:mb-12">
          Por que escolher a Agis Digital
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Mobile: grid 2x2, Desktop: single column */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-6">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row gap-3 md:gap-4 rounded-xl bg-deep-foreground/5 border border-deep-foreground/10 p-4 md:p-5"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 mx-auto md:mx-0">
                  <b.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-sm md:text-lg font-bold text-primary">{b.title}</h3>
                  <p className="text-xs md:text-sm text-deep-foreground/70 mt-1 leading-relaxed hidden md:block">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:flex justify-center">
            <img
              src={benefitsHero}
              alt="Segurança digital biometria"
              className="max-h-[500px] object-contain rounded-2xl"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
