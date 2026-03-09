import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Maria Silva",
    role: "Contadora",
    text: "Processo muito rápido e sem complicação. Recebi meu e-CPF no mesmo dia! Recomendo a Agis Digital.",
  },
  {
    name: "Carlos Oliveira",
    role: "Empresário",
    text: "Precisava do e-CNPJ com urgência e a equipe da Agis me atendeu prontamente. Excelente atendimento!",
  },
  {
    name: "Ana Santos",
    role: "Advogada",
    text: "Atendimento personalizado e muito profissional. A videoconferência foi simples e rápida. Super indico!",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl mb-12">
          O que dizem nossos clientes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col"
            >
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                "{t.text}"
              </p>
              <div className="mt-4 flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <div>
                <p className="font-bold text-card-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
