import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Bell, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAdminSettings } from "@/hooks/useAdminSettings";

export const AdminSettings = () => {
  const { settings, fetching, saving, updateField, saveKeys } = useAdminSettings();

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const allKeys = ["bestseller_active", "bestseller_product"];

  return (
    <div className="space-y-6">
      {/* Bestseller Badge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-primary" />
            Badge "Mais Vendido"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">Exibe um selo "⭐ Mais Vendido" sobre o card escolhido na seção de preços.</p>
          <div className="flex items-center gap-3">
            <Switch checked={settings.bestseller_active === "true"} onCheckedChange={(v) => updateField("bestseller_active", v ? "true" : "false")} />
            <span className="text-sm text-muted-foreground">Badge ativo</span>
          </div>
          <div className="space-y-1.5">
            <Label>Exibir no produto</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={settings.bestseller_product || "cnpj"} onChange={(e) => updateField("bestseller_product", e.target.value)}>
              <option value="cpf">e-CPF A1</option>
              <option value="cnpj">e-CNPJ A1</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => saveKeys(allKeys, "Configurações salvas!")} disabled={saving} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  );
};
