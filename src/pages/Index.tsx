import { useGeolocation } from "@/hooks/useGeolocation";
import { StickyHeader } from "@/components/landing/StickyHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { PricingSection } from "@/components/landing/PricingSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsApp } from "@/components/landing/FloatingWhatsApp";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";
import { ExitIntentPopup } from "@/components/landing/ExitIntentPopup";
import { useEffect } from "react";

const Index = () => {
  const { city, detected } = useGeolocation();

  // Fallback string for components that expect a non-null city
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
          ? `Emita seu Certificado Digital em ${city}. Emissão rápida, 100% online, com suporte especializado.`
          : "Emita seu Certificado Digital 100% online. Emissão rápida com suporte especializado. Certificação ICP-Brasil."
      );
    }
  }, [city, detected]);

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader city={cityDisplay} />
      <HeroSection city={city} detected={detected} />
      <SocialProofBar />
      <PricingSection city={cityDisplay} detected={detected} />
      <HowItWorksSection />
      <BenefitsSection />
      <TestimonialsSection />
      <FAQSection city={cityDisplay} />
      <CTASection city={cityDisplay} />
      <Footer />
      <FloatingWhatsApp />
      <StickyMobileCTA city={cityDisplay} />
      <ExitIntentPopup city={cityDisplay} />
    </div>
  );
};

export default Index;
