import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Building2, Loader2 } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const KEYS = ["footer_company_name", "footer_cnpj", "footer_address", "footer_instagram", "footer_facebook", "footer_linkedin"];

export const AdminFooter = () => {
  const { settings, fetching, saving, updateField, saveKeys } = useAdminSettings();

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

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
            <Input value={settings.footer_company_name ?? "Agis Digital"} onChange={(e) => updateField("footer_company_name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>CNPJ</Label>
            <Input value={settings.footer_cnpj ?? ""} onChange={(e) => updateField("footer_cnpj", e.target.value)} placeholder="00.000.000/0001-00" />
          </div>
          <div className="space-y-1.5">
            <Label>Endereço</Label>
            <Input value={settings.footer_address ?? ""} onChange={(e) => updateField("footer_address", e.target.value)} placeholder="Rua Exemplo, 123 - Cidade/UF" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Instagram (URL)</Label>
              <Input value={settings.footer_instagram ?? ""} onChange={(e) => updateField("footer_instagram", e.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-1.5">
              <Label>Facebook (URL)</Label>
              <Input value={settings.footer_facebook ?? ""} onChange={(e) => updateField("footer_facebook", e.target.value)} placeholder="https://facebook.com/..." />
            </div>
            <div className="space-y-1.5">
              <Label>LinkedIn (URL)</Label>
              <Input value={settings.footer_linkedin ?? ""} onChange={(e) => updateField("footer_linkedin", e.target.value)} placeholder="https://linkedin.com/..." />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => saveKeys(KEYS, "Rodapé salvo!")} disabled={saving} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar Rodapé"}
      </Button>
    </div>
  );
};
