import { Clock, Users, MapPin, Shield, Zap, HeadphonesIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Por que emitir seu Certificado Digital em{" "}
            <span className="text-primary">{city}</span> conosco?
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Oferecemos a melhor experiência para profissionais e empresas de {city} que precisam de certificação digital.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card
              key={benefit.title}
              className="group border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
            >
              <CardContent className="flex flex-col items-start gap-4 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
