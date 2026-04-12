import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, PanelTop, Loader2 } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const KEYS = ["header_cta_text"];

export const AdminHeader = () => {
  const { settings, fetching, saving, updateField, saveKeys } = useAdminSettings();

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PanelTop className="h-5 w-5 text-primary" />
            Cabeçalho Fixo (Header)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">O cabeçalho fixo aparece no topo da página ao rolar. Configure o texto do botão CTA.</p>
          <div className="space-y-1.5">
            <Label>Texto do Botão CTA</Label>
            <Input value={settings.header_cta_text || ""} onChange={(e) => updateField("header_cta_text", e.target.value)} placeholder="Iniciar emissão" />
          </div>
        </CardContent>
      </Card>
      <Button onClick={() => saveKeys(KEYS, "Header salvo!")} disabled={saving} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar Header"}
      </Button>
    </div>
  );
};
