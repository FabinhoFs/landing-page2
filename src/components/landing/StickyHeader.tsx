import { useState, useEffect } from "react";
import { WhatsAppButton } from "./WhatsAppButton";
import { useCtaMessages } from "@/hooks/useCtaMessages";

export const StickyHeader = ({ city }: { city: string }) => {
  const [scrolled, setScrolled] = useState(false);
  const { settings, getMessage } = useCtaMessages();

  const ctaText = settings.header_cta_text || "Iniciar emissão";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-deep/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
        <span className={`text-lg font-bold text-deep-foreground transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0"}`}>
          Agis Digital
        </span>
        <WhatsAppButton
          buttonId="cta_header"
          message={getMessage("cta_header", city)}
          size="sm"
          className="text-sm px-4 py-2"
        >
          {ctaText}
        </WhatsAppButton>
      </div>
    </header>
  );
};