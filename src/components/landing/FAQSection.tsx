import { Plus } from "lucide-react";
import { ShieldCheck, MessageCircle } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";
import React from "react";

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

export const FAQSection = ({ city }: FAQSectionProps) => {
  const faqs = [
    {
      question: "O certificado tem validade jurídica em todo o Brasil?",
      answer: `Sim! Todos os nossos certificados são emitidos sob a infraestrutura da ICP-Brasil, garantindo validade jurídica em ${city} e em todo o território nacional para assinar documentos, acessar a Receita Federal e emitir notas fiscais em qualquer estado.`,
    },
    {
      question: "Realmente não preciso sair de casa para emitir?",
      answer: "Exatamente. Todo o processo é feito via videoconferência. Você só precisa de um celular ou computador com câmera e seus documentos em mãos. Rápido, seguro e 100% online.",
    },
    {
      question: "E se eu tiver dificuldade para instalar?",
      answer: "Não se preocupe. Temos um time de suporte especializado que pode te auxiliar passo a passo. Se preferir, fazemos a instalação remota para você. Seu certificado estará pronto para uso.",
    },
    {
      question: "Quanto tempo demora para ficar pronto?",
      answer: "Após a videoconferência (que dura cerca de 10 a 15 minutos), seu certificado é liberado para emissão imediata. É a solução mais rápida do mercado.",
    },
    {
      question: "Quais documentos eu preciso?",
      answer: "Para e-CPF: RG ou CNH original. Para e-CNPJ: Documento de constituição da empresa (Contrato Social) e os documentos dos representantes legais.",
    },
  ];

  return (
    <section id="faq" className="bg-card py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-3xl font-bold text-card-foreground md:text-4xl mb-12">
          Perguntas Frequentes
        </h2>

        <AccordionPrimitive.Root type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </AccordionPrimitive.Root>

        {/* Garantia badge */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4">
            <ShieldCheck className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <p className="font-bold text-foreground text-sm">Garantia de Satisfação</p>
              <p className="text-xs text-muted-foreground">Satisfação garantida ou seu dinheiro de volta.</p>
            </div>
          </div>

          {/* CTA WhatsApp */}
          <p className="text-muted-foreground text-sm">
            Ainda tem dúvidas?
          </p>
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
