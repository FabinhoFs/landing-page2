import { Shield } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border/30 bg-deep py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-4 text-center text-sm text-deep-foreground/50">
          <div className="flex items-center gap-2 text-deep-foreground/70">
            <Shield className="h-4 w-4" />
            <span className="font-semibold">Certificação Digital</span>
          </div>
          <p>
            Ao navegar nesta página, coletamos dados de geolocalização para melhorar
            a experiência e nossos serviços de atendimento (LGPD).
          </p>
          <p>© {new Date().getFullYear()} — Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
