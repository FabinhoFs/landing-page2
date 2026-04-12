import { lazy, Suspense, useEffect } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { StickyHeader } from "@/components/landing/StickyHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { useTracking } from "@/hooks/useTracking";
import { useCtaMessages } from "@/hooks/useCtaMessages";
import { useSeoSettings } from "@/hooks/useSeoSettings";
import { captureUtmParams } from "@/lib/logAccess";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load below-the-fold sections to reduce initial JS bundle
const PainSection = lazy(() => import("@/components/landing/PainSection").then(m => ({ default: m.PainSection })));
const HowItWorksSection = lazy(() => import("@/components/landing/HowItWorksSection").then(m => ({ default: m.HowItWorksSection })));
const PricingSection = lazy(() => import("@/components/landing/PricingSection").then(m => ({ default: m.PricingSection })));
const BenefitsSection = lazy(() => import("@/components/landing/BenefitsSection").then(m => ({ default: m.BenefitsSection })));
const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const GuaranteeSection = lazy(() => import("@/components/landing/GuaranteeSection").then(m => ({ default: m.GuaranteeSection })));
const AuthoritySection = lazy(() => import("@/components/landing/AuthoritySection").then(m => ({ default: m.AuthoritySection })));
const FAQSection = lazy(() => import("@/components/landing/FAQSection").then(m => ({ default: m.FAQSection })));
const CTASection = lazy(() => import("@/components/landing/CTASection").then(m => ({ default: m.CTASection })));
const Footer = lazy(() => import("@/components/landing/Footer").then(m => ({ default: m.Footer })));
const FloatingWhatsApp = lazy(() => import("@/components/landing/FloatingWhatsApp").then(m => ({ default: m.FloatingWhatsApp })));
const StickyMobileCTA = lazy(() => import("@/components/landing/StickyMobileCTA").then(m => ({ default: m.StickyMobileCTA })));
const ExitIntentPopup = lazy(() => import("@/components/landing/ExitIntentPopup").then(m => ({ default: m.ExitIntentPopup })));

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

const SectionFallback = () => null;

const Index = () => {
  const { city, detected, safeFallback } = useGeolocation();
  const { trackPurchase } = useTracking();
  const { settings, isLoading } = useCtaMessages();
  const cityDisplay = city || safeFallback;

  useEffect(() => {
    captureUtmParams();
  }, []);

  useSeoSettings();

  useEffect(() => {
    const seoTitle = settings["seo_title"];
    if (seoTitle) {
      document.title = seoTitle;
    } else {
      document.title = detected
        ? `Certificado Digital em ${city} - Agis Digital`
        : "Certificado Digital Online - Agis Digital";
    }

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

  const isPreview = new URLSearchParams(window.location.search).get("preview") === "draft";

  return (
    <div className="min-h-screen bg-background">
      {isPreview && (
        <div className="fixed bottom-3 right-3 z-[100] bg-amber-500/90 text-amber-950 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1.5 pointer-events-none select-none">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-950/60 animate-pulse" />
          PRÉVIA
        </div>
      )}
      <StickyHeader city={cityDisplay} />
      <HeroSection city={city} detected={detected} />
      <SocialProofBar />
      <Suspense fallback={<SectionFallback />}>
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
      </Suspense>
    </div>
  );
};

export default Index;
