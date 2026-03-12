import { Star, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useState, useEffect } from "react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}

export const TestimonialsSection = () => {
  const { data: testimonials } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await supabase
        .from("testimonials" as any)
        .select("id, name, role, text, rating, sort_order")
        .eq("is_active", true)
        .order("sort_order");
      return (data as any as Testimonial[]) || [];
    },
    staleTime: 60000,
  });

  const items = testimonials || [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 16 : 1;
      setActiveIndex(Math.round(scrollLeft / cardWidth));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl mb-12">
          O que dizem nossos clientes
        </h2>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.map((t) => (
              <div key={t.id} className="min-w-[85vw] snap-center">
                <TestimonialCard testimonial={t} />
              </div>
            ))}
          </div>
          {/* Dots */}
          {items.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {items.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors ${i === activeIndex ? "bg-primary" : "bg-muted-foreground/30"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 flex flex-col h-full">
      <Quote className="h-8 w-8 text-primary/30 mb-4" />
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
        "{t.text}"
      </p>
      <div className="mt-4 flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, j) => (
          <Star key={j} className={`h-4 w-4 ${j < t.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
        ))}
      </div>
      <div>
        <p className="font-bold text-card-foreground text-sm">{t.name}</p>
        {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
      </div>
    </div>
  );
}
