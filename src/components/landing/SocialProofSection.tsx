import { Star } from "lucide-react";

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
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-medium text-primary">
            ★ Nota 4.9 no Google
          </p>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            O que nossos clientes dizem
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-lg border border-border bg-card p-6">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.city}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
