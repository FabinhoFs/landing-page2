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
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Perguntas Frequentes
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="rounded-lg border border-border bg-card px-5"
            >
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Ficou com alguma dúvida? Fale conosco!
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
