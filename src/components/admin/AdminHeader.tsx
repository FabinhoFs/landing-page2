import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, PanelTop, Loader2, Image, Phone } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const DEFAULT_CTA = "Iniciar emissão";
const KEYS = [
  "header_cta_text",
  "header_logo_url",
  "header_show_logo",
  "header_show_phone",
  "header_phone_display",
];

export const AdminHeader = () => {
  const { settings, fetching, saving, updateField, saveKeys } = useAdminSettings();

  if (fetching)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Image className="h-5 w-5 text-primary" />
            Logo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Exibir logo no header</Label>
            <Switch
              checked={settings.header_show_logo !== "false"}
              onCheckedChange={(v) => updateField("header_show_logo", v ? "true" : "false")}
            />
          </div>
          <div className="space-y-1.5">
            <Label>URL do Logo</Label>
            <Input
              placeholder="https://exemplo.com/logo.png"
              value={settings.header_logo_url ?? ""}
              onChange={(e) => updateField("header_logo_url", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Use uma imagem com fundo transparente (PNG) para melhor resultado em fundo escuro.
            </p>
          </div>
          {settings.header_logo_url && (
            <div className="rounded-md bg-deep p-4 flex items-center justify-center">
              <img
                src={settings.header_logo_url}
                alt="Preview do logo"
                className="h-12 w-auto object-contain max-w-[220px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Telefone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-5 w-5 text-primary" />
            Telefone no Topo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Exibir telefone no header</Label>
            <Switch
              checked={settings.header_show_phone !== "false"}
              onCheckedChange={(v) => updateField("header_show_phone", v ? "true" : "false")}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Telefone exibido (formatado)</Label>
            <Input
              placeholder="(24) 97402-2516"
              value={settings.header_phone_display ?? ""}
              onChange={(e) => updateField("header_phone_display", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Se vazio, será formatado automaticamente a partir do número do WhatsApp configurado na aba 12.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PanelTop className="h-5 w-5 text-primary" />
            Botão CTA do Header
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Texto do Botão CTA</Label>
            <Input
              value={settings.header_cta_text ?? DEFAULT_CTA}
              onChange={(e) => updateField("header_cta_text", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={() => saveKeys(KEYS, "Header salvo!")}
        disabled={saving}
        className="w-full sm:w-auto"
      >
        <Save className="mr-2 h-4 w-4" />
        {saving ? "Salvando..." : "Salvar Header"}
      </Button>
    </div>
  );
};
