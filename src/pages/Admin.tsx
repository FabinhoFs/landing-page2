import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/checkIsAdmin";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";
import { AdminHero } from "@/components/admin/AdminHero";
import { AdminPrices } from "@/components/admin/AdminPrices";
import { AdminDiferenciais } from "@/components/admin/AdminDiferenciais";
import { AdminTestimonials } from "@/components/admin/AdminTestimonials";
import { AdminFAQ } from "@/components/admin/AdminFAQ";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminIntegrations } from "@/components/admin/AdminIntegrations";
import { AdminUsers } from "@/components/admin/AdminUsers";

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }

      const isAdmin = await checkIsAdmin();
      if (!isAdmin) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

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
        <Tabs defaultValue="hero">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="prices">Preços</TabsTrigger>
            <TabsTrigger value="diferenciais">Diferenciais</TabsTrigger>
            <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="footer">Rodapé</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="integrations">Integrações e Pixels</TabsTrigger>
            <TabsTrigger value="dashboard">Inteligência</TabsTrigger>
          </TabsList>
          <TabsContent value="hero"><AdminHero /></TabsContent>
          <TabsContent value="prices"><AdminPrices /></TabsContent>
          <TabsContent value="diferenciais"><AdminDiferenciais /></TabsContent>
          <TabsContent value="testimonials"><AdminTestimonials /></TabsContent>
          <TabsContent value="faq"><AdminFAQ /></TabsContent>
          <TabsContent value="footer"><AdminFooter /></TabsContent>
          <TabsContent value="settings"><AdminSettings /></TabsContent>
          <TabsContent value="integrations"><AdminIntegrations /></TabsContent>
          <TabsContent value="dashboard"><AdminDashboard /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
