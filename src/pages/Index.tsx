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
import { useSeoSettings } from "@/hooks/useSeoSettings";
import { useFavicon } from "@/hooks/useFavicon";
import { captureUtmParams } from "@/lib/logAccess";
import { Skeleton } from "@/components/ui/skeleton";

const PageSkeleton = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <div className="h-16 bg-deep" />
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
  const { settings, isLoading } = useCtaMessages();
  const cityDisplay = city || "Brasil";

  // Capture UTM params on page load
  useEffect(() => {
    captureUtmParams();
  }, []);

  // Apply SEO settings and favicon
  useSeoSettings();
  useFavicon();

  useEffect(() => {
    // Use SEO title from admin if available, otherwise dynamic city-based
    const seoTitle = settings["seo_title"];
    if (seoTitle) {
      document.title = seoTitle;
    } else {
      document.title = detected
        ? `Certificado Digital em ${city} - Agis Digital`
        : "Certificado Digital Online - Agis Digital";
    }

    // Only set description if not already managed by useSeoSettings
    if (!settings["seo_description"]) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          detected
            ? `Emita seu Certificado Digital em ${city}. Validação rápida, 100% online, com suporte especializado.`
            : "Emita seu Certificado Digital 100% online. Validação rápida com suporte especializado. Certificação ICP-Brasil."
        );
      }
    }
  }, [city, detected, settings]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader city={cityDisplay} />
      <HeroSection city={city} detected={detected} />
      <SocialProofBar />
      <PainSection />
      <HowItWorksSection />
      <PricingSection city={cityDisplay} detected={detected} onTrackPurchase={trackPurchase} />
      <BenefitsSection />
      <TestimonialsSection />
      <GuaranteeSection city={cityDisplay} />
      <AuthoritySection />
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
