import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, MessageCircle, Phone, Loader2 } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";

export const AdminWhatsApp = () => {
  const { settings, fetching, saving, updateField, saveKeys } = useAdminSettings();

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const allKeys = [
    "whatsapp_number", "floating_whatsapp_enabled",
    "sticky_mobile_cta_text", "popup_enabled", "popup_title", "popup_subtitle",
    "popup_discount", "popup_cta_text",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-5 w-5 text-primary" />
            Número do WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>Número completo com DDI + DDD (somente números)</Label>
          <Input value={settings.whatsapp_number || ""} onChange={(e) => updateField("whatsapp_number", e.target.value.replace(/\D/g, ""))} placeholder="5524974022516" />
          <p className="text-xs text-muted-foreground">Exemplo: 55 (Brasil) + 24 (DDD) + 974022516 → <strong>5524974022516</strong></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-primary" />
            Botão Flutuante do WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Switch checked={settings.floating_whatsapp_enabled !== "false"} onCheckedChange={(v) => updateField("floating_whatsapp_enabled", v ? "true" : "false")} />
            <Label>Exibir botão flutuante</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-primary" />
            Barra Mobile Fixa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>Texto do botão mobile</Label>
          <Input value={settings.sticky_mobile_cta_text || ""} onChange={(e) => updateField("sticky_mobile_cta_text", e.target.value)} placeholder="Iniciar minha emissão agora" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-primary" />
            Pop-up de Saída
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={settings.popup_enabled === "true"} onCheckedChange={(v) => updateField("popup_enabled", v ? "true" : "false")} />
            <Label>Ativar pop-up de saída</Label>
          </div>
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input value={settings.popup_title || ""} onChange={(e) => updateField("popup_title", e.target.value)} placeholder="ESPERA! NÃO VÁ EMBORA." />
          </div>
          <div className="space-y-1.5">
            <Label>Subtítulo</Label>
            <Input value={settings.popup_subtitle || ""} onChange={(e) => updateField("popup_subtitle", e.target.value)} placeholder="Garanta um desconto exclusivo..." />
          </div>
          <div className="space-y-1.5">
            <Label>Valor do Cupom (R$)</Label>
            <Input value={settings.popup_discount || ""} onChange={(e) => updateField("popup_discount", e.target.value)} placeholder="20" />
          </div>
          <div className="space-y-1.5">
            <Label>Texto do botão CTA</Label>
            <Input value={settings.popup_cta_text || ""} onChange={(e) => updateField("popup_cta_text", e.target.value)} placeholder="Quero falar no WhatsApp" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => saveKeys(allKeys, "WhatsApp e Botões salvos!")} disabled={saving} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar WhatsApp e Botões"}
      </Button>
    </div>
  );
};
