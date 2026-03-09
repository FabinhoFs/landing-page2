import { useGeolocation } from "@/hooks/useGeolocation";
import { HeroSection } from "@/components/landing/HeroSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsApp } from "@/components/landing/FloatingWhatsApp";
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
      <HeroSection city={city} />
      <BenefitsSection city={city} />
      <HowItWorksSection />
      <SocialProofSection />
      <FAQSection city={city} />
      <CTASection city={city} />
      <Footer />
      <FloatingWhatsApp />
      <ExitIntentPopup city={city} />
    </div>
  );
};

export default Index;
