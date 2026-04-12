import { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { useCtaMessages } from "@/hooks/useCtaMessages";
import { useWhatsAppNumber } from "@/hooks/useWhatsAppNumber";

export const StickyHeader = ({ city }: { city: string }) => {
  const [scrolled, setScrolled] = useState(false);
  const { settings, getMessage } = useCtaMessages();
  const phone = useWhatsAppNumber();

  const ctaText = settings.header_cta_text || "Iniciar emissão";
  const logoUrl = settings.header_logo_url || "/logo-agis-digital.png";
  const showLogo = settings.header_show_logo !== "false";
  const showPhone = settings.header_show_phone !== "false";
  const phoneDisplay = settings.header_phone_display || formatPhone(phone);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handlePhoneClick = () => {
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-deep/95 backdrop-blur-md shadow-lg"
          : "bg-deep/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 py-2.5">
        {/* Logo */}
        <div className="flex items-center min-w-0">
          {showLogo && logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-10 sm:h-12 w-auto object-contain max-w-[180px] sm:max-w-[220px]"
            />
          ) : (
            <div className="w-1" />
          )}
        </div>

        {/* Phone + CTA */}
        <div className="flex items-center gap-3 sm:gap-5">
          {showPhone && (
            <button
              onClick={handlePhoneClick}
              className="hidden sm:flex items-center gap-2 text-deep-foreground/90 hover:text-deep-foreground transition-colors cursor-pointer"
            >
              <Phone className="h-5 w-5 text-whatsapp" />
              <span className="text-sm sm:text-base font-semibold tracking-wide">
                {phoneDisplay}
              </span>
            </button>
          )}

          <WhatsAppButton
            buttonId="cta_header"
            message={getMessage("cta_header", city)}
            size="sm"
            className="text-sm px-4 py-2"
          >
            {ctaText}
          </WhatsAppButton>
        </div>
      </div>
    </header>
  );
};

function formatPhone(raw: string): string {
  if (!raw || raw.length < 10) return raw;
  const cleaned = raw.replace(/\D/g, "");
  // Brazilian format: (XX) XXXXX-XXXX
  if (cleaned.startsWith("55") && cleaned.length >= 12) {
    const ddd = cleaned.slice(2, 4);
    const part1 = cleaned.slice(4, 9);
    const part2 = cleaned.slice(9, 13);
    return `(${ddd}) ${part1}-${part2}`;
  }
  return raw;
}
