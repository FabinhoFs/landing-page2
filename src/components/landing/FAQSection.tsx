import { Plus } from "lucide-react";
import { ShieldCheck } from "lucide-react";
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
  <AccordionPrimitive.Item ref={ref} className={cn("border border-border rounded-2xl px-6 bg-background", className)} {...props} />
));

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-5 font-semibold text-base transition-all text-left [&[data-state=open]>span>svg]:rotate-45",
        className,
      )}
      {...props}
    >
      {children}
      <span className="ml-4 flex-shrink-0 rounded-full bg-primary/10 p-1">
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
    <div className={cn("pb-5 pt-0 text-muted-foreground leading-relaxed", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

interface FAQSectionProps {
  city: string;
}

const FALLBACK_FAQS = [
  { id: "1", question: "O certificado tem validade jurídica em todo o Brasil?", answer: "Sim! Todos os nossos certificados são emitidos sob a infraestrutura da ICP-Brasil, garantindo validade jurídica em todo o território nacional." },
  { id: "2", question: "Realmente não preciso sair de casa para emitir?", answer: "Exatamente. Todo o processo é feito via videoconferência. Você só precisa de um celular ou computador com câmera e seus documentos em mãos." },
  { id: "3", question: "Quanto tempo demora para ficar pronto?", answer: "Após a videoconferência (que dura cerca de 10 a 15 minutos), seu certificado é liberado para emissão imediata." },
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
    <section id="faq" className="bg-card py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-3xl font-bold text-card-foreground md:text-4xl mb-12">
          Perguntas Frequentes
        </h2>

        <AccordionPrimitive.Root type="single" collapsible className="space-y-4">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
              <AccordionTrigger className="text-foreground hover:no-underline min-h-[48px]">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                {faq.answer.replace(/\{cidade\}/g, city)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </AccordionPrimitive.Root>

        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4">
            <ShieldCheck className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <p className="font-bold text-foreground text-sm">Garantia de Satisfação</p>
              <p className="text-xs text-muted-foreground">Satisfação garantida ou seu dinheiro de volta.</p>
            </div>
          </div>

          <p className="text-muted-foreground text-sm">Ainda tem dúvidas?</p>
          <WhatsAppButton
            buttonId="faq_duvidas"
            message={`Olá! Tenho dúvidas sobre Certificado Digital em ${city}.`}
            size="default"
            className="text-sm"
          >
            Fale com um especialista agora
          </WhatsAppButton>
        </div>
      </div>
    </section>
  );
};
