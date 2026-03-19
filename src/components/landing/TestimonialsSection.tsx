import { Star, BadgeCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useCallback } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  is_google_review: boolean;
}

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const TestimonialsSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const { data: testimonials } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("id, name, role, text, rating, sort_order, is_google_review")
        .eq("is_active", true)
        .order("sort_order");
      return (data as Testimonial[]) || [];
    },
    staleTime: 60000,
  });

  const items = testimonials || [];

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    setCount(api.scrollSnapList().length);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  if (items.length === 0) return null;

  return (
    <section className="bg-deep py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="text-center text-2xl font-bold text-deep-foreground md:text-4xl mb-10 md:mb-12">
          O que dizem nossos clientes
        </h2>

        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({ delay: 5000, stopOnInteraction: true }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {items.map((t) => (
              <CarouselItem
                key={t.id}
                className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
              >
                <TestimonialCard testimonial={t} />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="-left-4 md:-left-5 bg-white/10 border-primary/30 text-deep-foreground hover:bg-white/20" />
          <CarouselNext className="-right-4 md:-right-5 bg-white/10 border-primary/30 text-deep-foreground hover:bg-white/20" />
        </Carousel>

        {/* Dots */}
        {count > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                onClick={() => api?.scrollTo(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === current ? "bg-primary" : "bg-deep-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-lg shadow-black/20 p-5 md:p-6 flex flex-col h-full">
      {/* Header: stars left, Google icon right */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, j) => (
            <Star
              key={j}
              className={`h-4 w-4 ${
                 j < t.rating
                   ? "fill-[#FBBC05] text-[#FBBC05]"
                   : "text-deep-alt-foreground/30"
              }`}
            />
          ))}
        </div>
        {t.is_google_review && <GoogleIcon className="h-5 w-5" />}
      </div>

      {/* Text */}
      <p className="text-sm text-deep-alt-foreground/80 leading-relaxed flex-1">
        "{t.text}"
      </p>

      {/* Author */}
      <div className="mt-4 flex items-center gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-deep-alt-foreground text-sm">{t.name}</p>
            {t.is_google_review && (
              <BadgeCheck className="h-4 w-4 text-primary" />
            )}
          </div>
          {t.role && (
            <p className="text-xs text-deep-alt-foreground/60">{t.role}</p>
          )}
        </div>
      </div>
    </div>
  );
}
