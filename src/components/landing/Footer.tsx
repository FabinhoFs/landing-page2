export const Footer = () => {
  return (
    <footer className="bg-deep text-deep-foreground/60 py-6 border-t border-deep-foreground/10">
      <div className="mx-auto max-w-7xl px-6 text-center text-sm">
        Copyright © {new Date().getFullYear()} Agis Digital – Todos os direitos reservados
      </div>
    </footer>
  );
};
