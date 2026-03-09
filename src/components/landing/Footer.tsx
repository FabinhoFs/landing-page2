export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground space-y-2">
        <p>
          Ao navegar nesta página, coletamos dados de geolocalização para melhorar
          a experiência e nossos serviços (LGPD).
        </p>
        <p>© {new Date().getFullYear()} Agis Digital — Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};
