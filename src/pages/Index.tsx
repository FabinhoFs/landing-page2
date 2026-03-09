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
  const { city } = useGeolocation();

  useEffect(() => {
    document.title = `Certificado Digital em ${city} | Emissão Rápida e Segura`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", `Emita seu Certificado Digital em ${city}. Emissão rápida, 100% online, com suporte especializado. Certificação ICP-Brasil.`);
    }
  }, [city]);

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader city={city} />
      <HeroSection city={city} />
      <SocialProofBar />
      <PricingSection city={city} />
      <HowItWorksSection />
      <BenefitsSection />
      <TestimonialsSection />
      <FAQSection city={city} />
      <CTASection city={city} />
      <Footer />
      <FloatingWhatsApp />
      <StickyMobileCTA city={city} />
      <ExitIntentPopup city={city} />
    </div>
  );
};

export default Index;
