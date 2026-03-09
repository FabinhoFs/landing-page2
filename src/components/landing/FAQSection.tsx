import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WhatsAppButton } from "./WhatsAppButton";
import { supabase } from "@/integrations/supabase/client";

interface FAQSectionProps {
  city: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export const FAQSection = ({ city }: FAQSectionProps) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await supabase
        .from("faqs")
        .select("id, question, answer")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data) setFaqs(data);
    };
    fetchFaqs();
  }, []);

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Dúvidas frequentes sobre Certificado Digital em{" "}
            <span className="text-primary">{city}</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="rounded-xl border border-border/50 bg-card px-6 data-[state=open]:border-primary/30 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5"
            >
              <AccordionTrigger className="text-left font-semibold text-card-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="mb-4 text-muted-foreground">
            Ainda tem dúvidas? Fale com um especialista agora mesmo.
          </p>
          <WhatsAppButton
            buttonId="cta_faq"
            message={`Olá! Tenho dúvidas sobre Certificado Digital em ${city}.`}
          >
            Tirar minhas dúvidas
          </WhatsAppButton>
        </div>
      </div>
    </section>
  );
};
