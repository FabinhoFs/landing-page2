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
  { key: "cta_hero", label: "CTA 01 — Topo (Hero)", position: "Aparece no topo da página" },
  { key: "cta_header", label: "CTA — Cabeçalho fixo", position: "Aparece no header ao rolar" },
  { key: "cta_ecpf", label: "CTA 02 — Card e-CPF A1", position: "Aparece nos preços (e-CPF)" },
  { key: "cta_ecnpj", label: "CTA 03 — Card e-CNPJ A1", position: "Aparece nos preços (e-CNPJ)" },
  { key: "cta_floating", label: "CTA 04 — Flutuante", position: "Ícone fixo canto inferior direito" },
  { key: "cta_sticky_mobile", label: "CTA — Mobile fixo", position: "Barra fixa no celular" },
  { key: "cta_bottom", label: "CTA 05 — Rodapé", position: "Aparece no final da página" },
  { key: "cta_exit_popup", label: "CTA — Pop-up de saída", position: "Aparece ao sair da página" },
];

export const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings" as any)
        .select("key, value");
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
    const promises = Object.entries(settings).map(([key, value]) =>
      supabase
        .from("site_settings" as any)
        .update({ value, updated_at: new Date().toISOString() } as any)
        .eq("key", key)
    );

    const results = await Promise.all(promises);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      toast({ title: "Erro ao salvar", description: "Verifique os campos e tente novamente.", variant: "destructive" });
    } else {
      toast({ title: "Configurações salvas!", description: "Todas as alterações já estão ativas na Landing Page." });
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
            Configuração de Conversão — Mensagens dos CTAs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-xs text-muted-foreground">
            Use <code className="bg-muted px-1 rounded">{"{cidade}"}</code> para inserir a cidade detectada automaticamente. O URL Encode é aplicado automaticamente.
          </p>

          {CTA_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key} className="text-sm font-semibold">
                {field.label}
              </Label>
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

      {/* Popup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-primary" />
            Pop-up de Saída (Exit Intent)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">Status do Pop-up</Label>
              <p className="text-xs text-muted-foreground">Ativar ou desativar globalmente</p>
            </div>
            <Switch
              checked={settings.popup_enabled === "true"}
              onCheckedChange={(checked) => updateField("popup_enabled", checked ? "true" : "false")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="popup_discount" className="text-sm font-semibold">Valor do Cupom (R$)</Label>
            <p className="text-xs text-muted-foreground">Aparece como destaque no pop-up: "R$ [valor],00"</p>
            <Input
              id="popup_discount"
              type="number"
              value={settings.popup_discount || ""}
              onChange={(e) => updateField("popup_discount", e.target.value.replace(/\D/g, ""))}
              placeholder="20"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="popup_title" className="text-sm font-semibold">Título do Pop-up</Label>
            <Input
              id="popup_title"
              value={settings.popup_title || ""}
              onChange={(e) => updateField("popup_title", e.target.value)}
              placeholder="ESPERA! NÃO VÁ EMBORA."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="popup_subtitle" className="text-sm font-semibold">Subtítulo do Pop-up</Label>
            <Input
              id="popup_subtitle"
              value={settings.popup_subtitle || ""}
              onChange={(e) => updateField("popup_subtitle", e.target.value)}
              placeholder="Garanta um desconto exclusivo..."
            />
          </div>

          <p className="text-xs text-muted-foreground">
            💡 Na mensagem do CTA do pop-up, use <code className="bg-muted px-1 rounded">{"{valor}"}</code> para inserir o valor do cupom automaticamente.
          </p>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />
        {loading ? "Salvando..." : "Salvar todas as configurações"}
      </Button>
    </div>
  );
};
