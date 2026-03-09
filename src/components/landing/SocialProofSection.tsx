import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Carlos Henrique",
    city: "Barra Mansa",
    text: "Emiti meu e-CNPJ em menos de 40 minutos. Atendimento excelente!",
    rating: 5,
  },
  {
    name: "Maria Fernanda",
    city: "Volta Redonda",
    text: "Precisava do certificado urgente e consegui no mesmo dia. Recomendo!",
    rating: 5,
  },
  {
    name: "Roberto Silva",
    city: "Resende",
    text: "Processo 100% online, sem precisar sair de casa. Muito prático.",
    rating: 5,
  },
];

export const SocialProofSection = () => {
  return (
    <section className="bg-muted/50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Star className="h-4 w-4 fill-current" />
            Nota 4.9 no Google
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            O que nossos clientes dizem
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Milhares de certificados emitidos com excelência e agilidade.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-border/50 bg-card">
              <CardContent className="flex flex-col gap-4 p-8">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground italic">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-primary">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
