import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/checkIsAdmin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LogOut,
  Menu,
  LayoutDashboard,
  Type,
  Zap,
  Frown,
  Settings2,
  Tag,
  Award,
  MessageSquareQuote,
  ShieldCheck,
  Building2,
  HelpCircle,
  Megaphone,
  Footprints,
  MessageCircle,
  Settings,
  Plug,
  BarChart3,
  Users,
  FlaskConical,
  Link2,
  Gauge,
  AlertTriangle,
  History,
  FileText,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminHero } from "@/components/admin/AdminHero";
import { AdminDores } from "@/components/admin/AdminDores";
import { AdminComoFunciona } from "@/components/admin/AdminComoFunciona";
import { AdminPrices } from "@/components/admin/AdminPrices";
import { AdminOfertas } from "@/components/admin/AdminOfertas";
import { AdminDiferenciais } from "@/components/admin/AdminDiferenciais";
import { AdminTestimonials } from "@/components/admin/AdminTestimonials";
import { AdminSeguranca } from "@/components/admin/AdminSeguranca";
import { AdminInstitucional } from "@/components/admin/AdminInstitucional";
import { AdminFAQ } from "@/components/admin/AdminFAQ";
import { AdminCTAFinal } from "@/components/admin/AdminCTAFinal";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { AdminWhatsApp } from "@/components/admin/AdminWhatsApp";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminIntegrations } from "@/components/admin/AdminIntegrations";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminAlerts } from "@/components/admin/AdminAlerts";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";
import { AdminVersions } from "@/components/admin/AdminVersions";
import { AdminPublishBar } from "@/components/admin/AdminPublishBar";
import { AdminExperiments } from "@/components/admin/AdminExperiments";
import { AdminUtmRules } from "@/components/admin/AdminUtmRules";
import { AdminPerformance } from "@/components/admin/AdminPerformance";
import { AdminErrors } from "@/components/admin/AdminErrors";
import { usePendingErrors } from "@/hooks/usePendingErrors";

const NAV_ITEMS = [
  { key: "header", label: "Header", icon: Type },
  { key: "hero", label: "Hero", icon: Zap },
  { key: "dores", label: "Dores", icon: Frown },
  { key: "comofunciona", label: "Como Funciona", icon: Settings2 },
  { key: "ofertas", label: "Ofertas", icon: Tag },
  { key: "diferenciais", label: "Diferenciais", icon: Award },
  { key: "testimonials", label: "Depoimentos", icon: MessageSquareQuote },
  { key: "seguranca", label: "Segurança", icon: ShieldCheck },
  { key: "institucional", label: "Institucional", icon: Building2 },
  { key: "faq", label: "FAQ", icon: HelpCircle },
  { key: "ctafinal", label: "CTA Final", icon: Megaphone },
  { key: "footer", label: "Rodapé", icon: Footprints },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "settings", label: "Configurações", icon: Settings },
  { key: "integrations", label: "Integrações", icon: Plug },
  { key: "dashboard", label: "Inteligência", icon: BarChart3 },
  { key: "users", label: "Administradores", icon: Users },
  { key: "experiments", label: "Experimentos", icon: FlaskConical },
  { key: "utm", label: "UTM", icon: Link2 },
  { key: "performance", label: "Performance", icon: Gauge },
  { key: "errors", label: "Diagnóstico", icon: AlertTriangle },
  { key: "versions", label: "Versões", icon: FileText },
  { key: "audit", label: "Histórico", icon: History },
];

const CONTENT_MAP: Record<string, React.ReactNode> = {
  header: <AdminHeader />,
  hero: <AdminHero />,
  dores: <AdminDores />,
  comofunciona: <AdminComoFunciona />,
  ofertas: <><AdminOfertas /><div className="mt-8 border-t pt-8"><AdminPrices /></div></>,
  diferenciais: <AdminDiferenciais />,
  testimonials: <AdminTestimonials />,
  seguranca: <AdminSeguranca />,
  institucional: <AdminInstitucional />,
  faq: <AdminFAQ />,
  ctafinal: <AdminCTAFinal />,
  footer: <AdminFooter />,
  whatsapp: <AdminWhatsApp />,
  settings: <AdminSettings />,
  integrations: <AdminIntegrations />,
  dashboard: <AdminDashboard />,
  users: <AdminUsers />,
  experiments: <AdminExperiments />,
  utm: <AdminUtmRules />,
  performance: <AdminPerformance />,
  errors: <AdminErrors />,
  versions: <AdminVersions />,
  audit: <AdminAuditLog />,
};

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const pendingErrorCount = usePendingErrors();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
      const isAdmin = await checkIsAdmin();
      if (!isAdmin) { await supabase.auth.signOut(); navigate("/admin/login"); return; }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/admin/login");
    });

    checkAuth();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const handleNav = (key: string) => {
    setActiveSection(key);
    setMobileOpen(false);
  };

  const NavItems = () => (
    <nav className="flex flex-col gap-0.5 py-2">
      {NAV_ITEMS.map((item, idx) => {
        const isActive = activeSection === item.key;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            onClick={() => handleNav(item.key)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{`${String(idx).padStart(2, "0")}. ${item.label}`}</span>
            {item.key === "errors" && pendingErrorCount > 0 && (
              <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px]">
                {pendingErrorCount}
              </Badge>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h1 className="text-base font-bold text-foreground">Painel Admin</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 px-2">
          <NavItems />
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between border-b border-border bg-card px-4 py-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                <h1 className="text-base font-bold text-foreground">Painel Admin</h1>
              </div>
              <ScrollArea className="h-[calc(100vh-57px)] px-2">
                <NavItems />
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <h1 className="text-base font-bold text-foreground">Painel Admin</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-6 py-8">
            <AdminPublishBar />
            <AdminAlerts />
            {CONTENT_MAP[activeSection]}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
