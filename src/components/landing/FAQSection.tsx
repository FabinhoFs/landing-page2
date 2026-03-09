import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fallbackFaqs = [
  { question: "O que é um certificado digital?", answer: "O Certificado Digital é uma identidade eletrônica que permite assinar documentos com validade jurídica, acessar sistemas do governo e realizar transações seguras pela internet." },
  { question: "Qual o prazo de validade de um Certificado Digital?", answer: "Os certificados digitais geralmente têm validade de 1 a 3 anos, dependendo do tipo escolhido." },
  { question: "Em quanto tempo terei meu certificado digital pronto?", answer: "Com a Agis Digital, seu certificado pode ser emitido no mesmo dia após a validação por videoconferência." },
  { question: "Quais os documentos necessários?", answer: "Para pessoa física (e-CPF): documento de identidade com foto, CPF e comprovante de residência. Para pessoa jurídica (e-CNPJ): documentos da empresa e do representante legal." },
];

interface FAQSectionProps {
  city: string;
}

export const FAQSection = ({ city }: FAQSectionProps) => {
  const { data: dbFaqs } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("faqs")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      return data;
    },
  });

  const faqs = dbFaqs && dbFaqs.length > 0 ? dbFaqs : fallbackFaqs;

  return (
    <section className="bg-card py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-3xl font-bold text-card-foreground md:text-4xl mb-12">
          Perguntas Frequentes
        </h2>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-border rounded-xl px-6 bg-background"
            >
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
