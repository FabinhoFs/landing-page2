import { useGeolocation } from "@/hooks/useGeolocation";
import { StickyHeader } from "@/components/landing/StickyHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsApp } from "@/components/landing/FloatingWhatsApp";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";
import { ExitIntentPopup } from "@/components/landing/ExitIntentPopup";
import { useEffect } from "react";

const Index = () => {
  const { city, detected } = useGeolocation();
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

      {/* 1ª Dobra — Hero */}
      <HeroSection city={city} detected={detected} />

      {/* 2ª Dobra — Preços */}
      <PricingSection city={cityDisplay} detected={detected} />

      {/* 3ª Dobra — Diferenciais / Prova Social */}
      <BenefitsSection />

      {/* 4ª Dobra — Depoimentos */}
      <TestimonialsSection />

      {/* 5ª Dobra — FAQ */}
      <FAQSection city={cityDisplay} />

      {/* 6ª Dobra — Rodapé */}
      <Footer />

      {/* Overlays */}
      <FloatingWhatsApp />
      <StickyMobileCTA city={cityDisplay} />
      <ExitIntentPopup city={cityDisplay} />
    </div>
  );
};

export default Index;
