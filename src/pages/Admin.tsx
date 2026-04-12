import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/checkIsAdmin";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";
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

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-foreground">Painel Admin</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <AdminPublishBar />
        <AdminAlerts />
        <Tabs defaultValue="hero">
          <TabsList className="mb-6 flex-wrap h-auto gap-1 justify-start">
            <TabsTrigger value="header">00. Header</TabsTrigger>
            <TabsTrigger value="hero">01. Hero</TabsTrigger>
            <TabsTrigger value="dores">02. Dores</TabsTrigger>
            <TabsTrigger value="comofunciona">03. Como Funciona</TabsTrigger>
            <TabsTrigger value="ofertas">04. Ofertas</TabsTrigger>
            <TabsTrigger value="diferenciais">05. Diferenciais</TabsTrigger>
            <TabsTrigger value="testimonials">06. Depoimentos</TabsTrigger>
            <TabsTrigger value="seguranca">07. Segurança</TabsTrigger>
            <TabsTrigger value="institucional">08. Institucional</TabsTrigger>
            <TabsTrigger value="faq">09. FAQ</TabsTrigger>
            <TabsTrigger value="ctafinal">10. CTA Final</TabsTrigger>
            <TabsTrigger value="footer">11. Rodapé</TabsTrigger>
            <TabsTrigger value="whatsapp">12. WhatsApp</TabsTrigger>
            <TabsTrigger value="settings">13. Configurações</TabsTrigger>
            <TabsTrigger value="integrations">14. Integrações</TabsTrigger>
            <TabsTrigger value="dashboard">15. Inteligência</TabsTrigger>
            <TabsTrigger value="users">16. Administradores</TabsTrigger>
            <TabsTrigger value="experiments">17. Experimentos</TabsTrigger>
            <TabsTrigger value="versions">18. Versões</TabsTrigger>
            <TabsTrigger value="audit">19. Histórico</TabsTrigger>
          </TabsList>
          <TabsContent value="header"><AdminHeader /></TabsContent>
          <TabsContent value="hero"><AdminHero /></TabsContent>
          <TabsContent value="dores"><AdminDores /></TabsContent>
          <TabsContent value="comofunciona"><AdminComoFunciona /></TabsContent>
          <TabsContent value="ofertas"><AdminOfertas /><div className="mt-8 border-t pt-8"><AdminPrices /></div></TabsContent>
          <TabsContent value="diferenciais"><AdminDiferenciais /></TabsContent>
          <TabsContent value="testimonials"><AdminTestimonials /></TabsContent>
          <TabsContent value="seguranca"><AdminSeguranca /></TabsContent>
          <TabsContent value="institucional"><AdminInstitucional /></TabsContent>
          <TabsContent value="faq"><AdminFAQ /></TabsContent>
          <TabsContent value="ctafinal"><AdminCTAFinal /></TabsContent>
          <TabsContent value="footer"><AdminFooter /></TabsContent>
          <TabsContent value="whatsapp"><AdminWhatsApp /></TabsContent>
          <TabsContent value="settings"><AdminSettings /></TabsContent>
          <TabsContent value="integrations"><AdminIntegrations /></TabsContent>
          <TabsContent value="dashboard"><AdminDashboard /></TabsContent>
          <TabsContent value="users"><AdminUsers /></TabsContent>
          <TabsContent value="experiments"><AdminExperiments /></TabsContent>
          <TabsContent value="versions"><AdminVersions /></TabsContent>
          <TabsContent value="audit"><AdminAuditLog /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
