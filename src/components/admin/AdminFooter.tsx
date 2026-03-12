import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, Building2 } from "lucide-react";

export const AdminFooter = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings" as any).select("key, value");
      if (data) {
        const map: Record<string, string> = {};
        (data as any[]).forEach((r: any) => { map[r.key] = r.value; });
        setSettings(map);
      }
    };
    fetch();
  }, []);

  const updateField = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    const keys = ["footer_company_name", "footer_cnpj", "footer_address", "footer_instagram", "footer_facebook", "footer_linkedin"];
    const payload = keys
      .filter(k => settings[k] !== undefined)
      .map((key) => ({ key, value: settings[key], updated_at: new Date().toISOString() }));

    if (payload.length > 0) {
      const { error } = await supabase.from("site_settings" as any).upsert(payload as any, { onConflict: "key" });
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
    }
    toast({ title: "Rodapé salvo!", description: "As alterações já estão ativas." });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-primary" />
            Informações do Rodapé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label>Nome da Empresa</Label>
            <Input
              value={settings.footer_company_name || ""}
              onChange={(e) => updateField("footer_company_name", e.target.value)}
              placeholder="Agis Digital"
            />
          </div>

          <div className="space-y-1.5">
            <Label>CNPJ</Label>
            <Input
              value={settings.footer_cnpj || ""}
              onChange={(e) => updateField("footer_cnpj", e.target.value)}
              placeholder="00.000.000/0001-00"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Endereço</Label>
            <Input
              value={settings.footer_address || ""}
              onChange={(e) => updateField("footer_address", e.target.value)}
              placeholder="Rua Exemplo, 123 - Cidade/UF"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Instagram (URL)</Label>
              <Input
                value={settings.footer_instagram || ""}
                onChange={(e) => updateField("footer_instagram", e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Facebook (URL)</Label>
              <Input
                value={settings.footer_facebook || ""}
                onChange={(e) => updateField("footer_facebook", e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>LinkedIn (URL)</Label>
              <Input
                value={settings.footer_linkedin || ""}
                onChange={(e) => updateField("footer_linkedin", e.target.value)}
                placeholder="https://linkedin.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />
        {loading ? "Salvando..." : "Salvar Rodapé"}
      </Button>
    </div>
  );
};
