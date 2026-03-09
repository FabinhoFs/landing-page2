import { Clock, Users, MapPin, Shield, Zap, HeadphonesIcon } from "lucide-react";

interface BenefitsSectionProps {
  city: string;
}

const benefits = [
  {
    icon: Clock,
    title: "Emissão Rápida",
    description: "Seu certificado digital pronto em até 30 minutos. Sem burocracia.",
  },
  {
    icon: Users,
    title: "Atendimento Personalizado",
    description: "Equipe especializada para te guiar em cada etapa do processo.",
  },
  {
    icon: MapPin,
    title: "Suporte Local",
    description: "Atendimento próximo a você, com conhecimento da sua região.",
  },
  {
    icon: Shield,
    title: "Segurança Garantida",
    description: "Certificação dentro dos padrões ICP-Brasil com validade jurídica.",
  },
  {
    icon: Zap,
    title: "100% Online",
    description: "Emissão por videoconferência. Sem necessidade de deslocamento.",
  },
  {
    icon: HeadphonesIcon,
    title: "Suporte Pós-Venda",
    description: "Assistência completa mesmo após a emissão do seu certificado.",
  },
];

export const BenefitsSection = ({ city }: BenefitsSectionProps) => {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Por que emitir seu Certificado Digital em{" "}
            <span className="text-primary">{city}</span>?
          </h2>
          <p className="mt-3 mx-auto max-w-2xl text-muted-foreground">
            Oferecemos a melhor experiência para profissionais e empresas.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <benefit.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
