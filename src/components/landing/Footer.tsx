import { useCtaMessages } from "@/hooks/useCtaMessages";

export const Footer = () => {
  const { settings } = useCtaMessages();

  const companyName = settings.footer_company_name || "Agis Digital";
  const cnpj = settings.footer_cnpj;
  const address = settings.footer_address;
  const instagram = settings.footer_instagram;
  const facebook = settings.footer_facebook;
  const linkedin = settings.footer_linkedin;

  const hasSocial = instagram || facebook || linkedin;

  return (
    <footer className="bg-deep text-deep-foreground/60 py-10 md:py-12 border-t border-deep-foreground/10">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center text-center md:items-start md:text-left gap-3 md:gap-4">
          <p className="font-semibold text-deep-foreground/80 text-base">{companyName}</p>

          {cnpj && <p className="text-sm">CNPJ: {cnpj}</p>}
          {address && <p className="text-sm">{address}</p>}

          {hasSocial && (
            <div className="flex gap-4 mt-2">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">
                  Instagram
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">
                  Facebook
                </a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">
                  LinkedIn
                </a>
              )}
            </div>
          )}

          <p className="text-xs mt-4 text-deep-foreground/40">
            Copyright © {new Date().getFullYear()} {companyName} – Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
};
