import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WhatsAppButton } from "./WhatsAppButton";

interface FAQSectionProps {
  city: string;
}

const faqs = [
  {
    id: "1",
    question: "Como funciona a emissão do Certificado Digital?",
    answer:
      "O processo é simples: você escolhe o tipo de certificado, envia os documentos necessários e realiza a validação por videoconferência. Em poucos minutos, seu certificado estará pronto para uso.",
  },
  {
    id: "2",
    question: "Preciso ir presencialmente para emitir?",
    answer:
      "Não! A emissão pode ser feita 100% online, por videoconferência. Você não precisa sair de casa ou do escritório.",
  },
  {
    id: "3",
    question: "Quais documentos são necessários?",
    answer:
      "Para pessoa física (e-CPF): documento de identidade com foto e CPF. Para pessoa jurídica (e-CNPJ): contrato social, CNPJ e documento do responsável legal.",
  },
  {
    id: "4",
    question: "Qual a validade do Certificado Digital?",
    answer:
      "Os certificados possuem validade de 1 a 3 anos, dependendo do modelo escolhido. Certificados A1 têm validade de 1 ano e A3 de até 3 anos.",
  },
  {
    id: "5",
    question: "Posso usar o certificado para o eSocial e SPED?",
    answer:
      "Sim! Nossos certificados são homologados pela ICP-Brasil e compatíveis com todas as obrigações fiscais, incluindo eSocial, SPED, NFe e muito mais.",
  },
];

export const FAQSection = ({ city }: FAQSectionProps) => {
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
