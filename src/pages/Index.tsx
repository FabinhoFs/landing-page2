import { useGeolocation } from "@/hooks/useGeolocation";
import { StickyHeader } from "@/components/landing/StickyHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { PainSection } from "@/components/landing/PainSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { GuaranteeSection } from "@/components/landing/GuaranteeSection";
import { AuthoritySection } from "@/components/landing/AuthoritySection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsApp } from "@/components/landing/FloatingWhatsApp";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";
import { ExitIntentPopup } from "@/components/landing/ExitIntentPopup";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { useCtaMessages } from "@/hooks/useCtaMessages";
import { Skeleton } from "@/components/ui/skeleton";

const PageSkeleton = () => (
  <div className="min-h-screen bg-background flex flex-col">
    {/* Header skeleton */}
    <div className="h-16 bg-deep" />
    {/* Hero skeleton */}
    <div className="bg-deep py-16 md:py-28 flex-1">
      <div className="max-w-3xl mx-auto px-4 space-y-6 text-center">
        <Skeleton className="h-6 w-40 mx-auto bg-deep-foreground/10" />
        <Skeleton className="h-12 w-full max-w-lg mx-auto bg-deep-foreground/10" />
        <Skeleton className="h-12 w-full max-w-md mx-auto bg-deep-foreground/10" />
        <Skeleton className="h-5 w-full max-w-xl mx-auto bg-deep-foreground/10" />
        <Skeleton className="h-5 w-48 mx-auto bg-deep-foreground/10" />
        <div className="flex gap-4 justify-center pt-4">
          <Skeleton className="h-14 w-48 rounded-lg bg-deep-foreground/10" />
          <Skeleton className="h-14 w-48 rounded-lg bg-deep-foreground/10" />
        </div>
      </div>
    </div>
  </div>
);

const Index = () => {
  const { city, detected } = useGeolocation();
  const { trackPurchase } = useTracking();
  const { isLoading } = useCtaMessages();
  const cityDisplay = city || "Brasil";

  useEffect(() => {
    document.title = detected
      ? `Certificado Digital em ${city} - Agis Digital`
      : "Certificado Digital Online - Agis Digital";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        detected
          ? `Emita seu Certificado Digital em ${city}. Validação rápida, 100% online, com suporte especializado.`
          : "Emita seu Certificado Digital 100% online. Validação rápida com suporte especializado. Certificação ICP-Brasil."
      );
    }
  }, [city, detected]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 00 — Header */}
      <StickyHeader city={cityDisplay} />

      {/* 01 — Hero */}
      <HeroSection city={city} detected={detected} />

      {/* Barra de Prova Social */}
      <SocialProofBar />

      {/* 02 — Dores */}
      <PainSection />

      {/* 03 — Como Funciona */}
      <HowItWorksSection />

      {/* 04 — Ofertas */}
      <PricingSection city={cityDisplay} detected={detected} onTrackPurchase={trackPurchase} />

      {/* 05 — Diferenciais */}
      <BenefitsSection />

      {/* 06 — Depoimentos */}
      <TestimonialsSection />

      {/* 07 — Segurança */}
      <GuaranteeSection city={cityDisplay} />

      {/* 08 — Institucional */}
      <AuthoritySection />

      {/* 09 — FAQ */}
      <FAQSection city={cityDisplay} />

      {/* 11 — CTA Final */}
      <CTASection city={cityDisplay} />

      {/* 12 — Rodapé */}
      <Footer />

      {/* 13 — WhatsApp Flutuante */}
      <FloatingWhatsApp />
      <StickyMobileCTA city={cityDisplay} />
      <ExitIntentPopup city={cityDisplay} />
    </div>
  );
};

export default Index;
