import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, Phone, MessageCircle, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const CTA_FIELDS = [
  { key: "cta_hero", label: "Mensagem — Topo (Hero)", position: "Enviada ao clicar nos botões do topo" },
  { key: "cta_header", label: "Mensagem — Cabeçalho fixo", position: "Enviada ao clicar no botão do header ao rolar" },
  { key: "cta_ecpf", label: "Mensagem — Card e-CPF", position: "Enviada ao clicar no botão do card e-CPF" },
  { key: "cta_ecnpj", label: "Mensagem — Card e-CNPJ", position: "Enviada ao clicar no botão do card e-CNPJ" },
  { key: "cta_floating", label: "Mensagem — Botão Flutuante", position: "Enviada ao clicar no ícone do WhatsApp fixo" },
  { key: "cta_sticky_mobile", label: "Mensagem — Barra Mobile", position: "Enviada ao clicar na barra fixa do celular" },
  { key: "cta_bottom", label: "Mensagem — Final da Página", position: "Enviada ao clicar no botão do final" },
  { key: "cta_exit_popup", label: "Mensagem — Pop-up de Desconto", position: "Enviada ao clicar no pop-up de saída" },
];

export const AdminSettings = () => {
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
    const keys = [
      "whatsapp_number",
      ...CTA_FIELDS.map(f => f.key),
      "bestseller_active", "bestseller_product",
    ];
    const payload = keys
      .filter(k => settings[k] !== undefined)
      .map(key => ({ key, value: settings[key], updated_at: new Date().toISOString() }));

    if (payload.length > 0) {
      const { error } = await supabase.from("site_settings" as any).upsert(payload as any, { onConflict: "key" });
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Configurações salvas!", description: "Todas as alterações já estão ativas." });
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Number */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-5 w-5 text-primary" />
            Número do WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Número completo com DDI + DDD (somente números)</Label>
            <Input
              id="whatsapp"
              placeholder="5524974022516"
              value={settings.whatsapp_number || ""}
              onChange={(e) => updateField("whatsapp_number", e.target.value.replace(/\D/g, ""))}
            />
            <p className="text-xs text-muted-foreground">
              Exemplo: 55 (Brasil) + 24 (DDD) + 974022516 → <strong>5524974022516</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-primary" />
            Mensagens do WhatsApp por Botão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-xs text-muted-foreground">
            Configure a mensagem que o cliente envia ao clicar em cada botão. Use <code className="bg-muted px-1 rounded">{"{cidade}"}</code> para inserir a cidade automaticamente.
          </p>
          {CTA_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key} className="text-sm font-semibold">{field.label}</Label>
              <p className="text-xs text-muted-foreground">📍 {field.position}</p>
              <Input
                id={field.key}
                value={settings[field.key] || ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder="Mensagem personalizada..."
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bestseller Badge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-primary" />
            Badge "Mais Vendido"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Exibe um selo "⭐ Mais Vendido" sobre o card escolhido na seção de preços.
          </p>
          <div className="flex items-center gap-3">
            <Switch
              checked={settings.bestseller_active === "true"}
              onCheckedChange={(v) => updateField("bestseller_active", v ? "true" : "false")}
            />
            <span className="text-sm text-muted-foreground">Badge ativo</span>
          </div>
          <div className="space-y-1.5">
            <Label>Exibir no produto</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={settings.bestseller_product || "cnpj"}
              onChange={(e) => updateField("bestseller_product", e.target.value)}
            >
              <option value="cpf">e-CPF A1</option>
              <option value="cnpj">e-CNPJ A1</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />
        {loading ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  );
};
