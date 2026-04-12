import { Plus } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border border-border rounded-2xl px-4 md:px-6 bg-background", className)} {...props} />
));

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 md:py-5 font-semibold text-sm md:text-base transition-all text-left [&[data-state=open]>span>svg]:rotate-45 min-h-[48px]",
        className,
      )}
      {...props}
    >
      {children}
      <span className="ml-3 md:ml-4 flex-shrink-0 rounded-full bg-primary/10 p-1">
        <Plus className="h-5 w-5 text-primary transition-transform duration-300" />
      </span>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 md:pb-5 pt-0 text-muted-foreground leading-relaxed", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

interface FAQSectionProps {
  city: string;
}

const FALLBACK_FAQS = [
  { id: "1", question: "Como funciona a emissão do Certificado Digital?", answer: "O processo é realizado online: você escolhe o tipo de certificado, envia os dados necessários, faz a validação por videoconferência e conclui sua emissão com orientação da nossa equipe. A videoconferência pode acontecer em poucos minutos, e a conclusão ocorre após a validação e aprovação do processo." },
  { id: "2", question: "Em quanto tempo consigo fazer a validação?", answer: "A validação por videoconferência pode ser agendada rapidamente, conforme disponibilidade. O tempo da validação em si costuma ser breve, mas a conclusão da emissão depende da aprovação do processo." },
  { id: "3", question: "A emissão pode ser concluída no mesmo dia?", answer: "Em muitos casos, sim. A conclusão depende do andamento correto das etapas, da conferência dos dados e da aprovação do processo." },
  { id: "4", question: "Preciso ir presencialmente para emitir?", answer: "Não necessariamente. O processo pode ocorrer online, com validação por videoconferência, conforme o fluxo aplicável." },
  { id: "5", question: "Posso fazer tudo pelo celular?", answer: "Em muitos casos, sim. Também é possível utilizar notebook para mais conforto durante o processo." },
  { id: "6", question: "Quais documentos são necessários?", answer: "Os documentos variam conforme o tipo de certificado. Nossa equipe orienta você no início do atendimento sobre o que é necessário." },
  { id: "7", question: "O certificado funciona para e-CAC, eSocial, SPED e NF-e?", answer: "Sim, desde que você escolha o certificado adequado para sua necessidade. Nossa equipe pode orientar essa escolha." },
  { id: "8", question: "Vocês fazem a emissão por mim?", answer: "Não. A emissão é realizada pelo titular ou responsável pelo certificado. Nossa equipe oferece suporte e orientação durante todo o processo, mas a conclusão é feita por você." },
  { id: "9", question: "Vocês ajudam na instalação e no uso?", answer: "Sim. Oferecemos orientação para instalação e uso, sempre preservando a segurança do processo e o controle do titular sobre seus dados de acesso." },
];

export const FAQSection = ({ city }: FAQSectionProps) => {
  const { data: dbFaqs } = useQuery({
    queryKey: ["faqs_landing"],
    queryFn: async () => {
      const { data } = await supabase
        .from("faqs")
        .select("id, question, answer, sort_order")
        .eq("is_active", true)
        .order("sort_order");
      return data || [];
    },
    staleTime: 60000,
  });

  const faqs = (dbFaqs && dbFaqs.length > 0) ? dbFaqs : FALLBACK_FAQS;

  return (
    <section id="faq" className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <h2 className="text-center text-2xl font-bold text-card-foreground md:text-4xl mb-10 md:mb-12">
          Perguntas Frequentes
        </h2>

        <AccordionPrimitive.Root type="single" collapsible className="space-y-3 md:space-y-4">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
              <AccordionTrigger className="text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                {faq.answer.replace(/\{cidade\}/g, city)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </AccordionPrimitive.Root>

        <div className="mt-10 md:mt-12 flex flex-col items-center gap-5">
          <p className="text-muted-foreground text-sm">Ainda tem dúvidas?</p>
          <WhatsAppButton
            buttonId="faq_duvidas"
            message={`Olá! Tenho dúvidas sobre Certificado Digital em ${city}.`}
            size="default"
            className="text-sm"
          >
            Falar com um especialista
          </WhatsAppButton>
        </div>
      </div>
    </section>
  );
};
