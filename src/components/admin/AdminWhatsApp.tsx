import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, MessageCircle, Phone, Loader2 } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const CTA_FIELDS = [
  { key: "cta_hero", label: "Mensagem — Hero (botões principais)", position: "Enviada ao clicar nos botões do Hero", default: "Olá! Quero emitir meu Certificado Digital em {cidade}." },
  { key: "cta_header", label: "Mensagem — Cabeçalho fixo", position: "Enviada ao clicar no botão do header ao rolar", default: "Olá! Quero falar com um especialista em Certificado Digital em {cidade}." },
  { key: "cta_pain", label: "Mensagem — Seção Dores", position: "Enviada ao clicar no CTA da seção de problemas", default: "Olá! Quero resolver minha situação e emitir meu Certificado Digital em {cidade}." },
  { key: "cta_ecpf", label: "Mensagem — Card e-CPF", position: "Enviada ao clicar no botão do card e-CPF", default: "Olá! Quero emitir meu e-CPF A1 em {cidade}." },
  { key: "cta_ecnpj", label: "Mensagem — Card e-CNPJ", position: "Enviada ao clicar no botão do card e-CNPJ", default: "Olá! Quero emitir meu e-CNPJ A1 em {cidade}." },
  { key: "cta_guarantee", label: "Mensagem — Seção Segurança", position: "Enviada ao clicar no CTA de tirar dúvidas", default: "Olá! Quero tirar dúvidas sobre Certificado Digital em {cidade}." },
  { key: "cta_faq", label: "Mensagem — FAQ", position: "Enviada ao clicar no botão abaixo do FAQ", default: "Olá! Tenho dúvidas sobre Certificado Digital em {cidade}." },
  { key: "cta_floating", label: "Mensagem — Botão Flutuante", position: "Enviada ao clicar no ícone do WhatsApp fixo", default: "Olá! Quero atendimento rápido para emitir meu Certificado Digital." },
  { key: "cta_sticky_mobile", label: "Mensagem — Barra Mobile", position: "Enviada ao clicar na barra fixa do celular", default: "Olá! Quero emitir meu Certificado Digital agora." },
  { key: "cta_bottom", label: "Mensagem — CTA Final", position: "Enviada ao clicar no botão do final da página", default: "Olá! Quero iniciar a emissão do meu Certificado Digital." },
  { key: "cta_exit_popup", label: "Mensagem — Pop-up de Desconto", position: "Enviada ao clicar no pop-up de saída", default: "Olá! Vi o desconto e quero aproveitar agora." },
];

export const AdminWhatsApp = () => {
  const { settings, fetching, saving, updateField, saveKeys } = useAdminSettings();

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const allKeys = [
    "whatsapp_number", "floating_whatsapp_enabled",
    "sticky_mobile_cta_text", "popup_enabled", "popup_title", "popup_subtitle",
    "popup_discount", "popup_cta_text",
    ...CTA_FIELDS.map(f => f.key),
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
          <Input value={settings.whatsapp_number ?? ""} onChange={(e) => updateField("whatsapp_number", e.target.value.replace(/\D/g, ""))} placeholder="5524974022516" />
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
          <Input value={settings.sticky_mobile_cta_text ?? "Iniciar minha emissão agora"} onChange={(e) => updateField("sticky_mobile_cta_text", e.target.value)} />
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
            <Input value={settings.popup_title ?? "ESPERA! NÃO VÁ EMBORA."} onChange={(e) => updateField("popup_title", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Subtítulo</Label>
            <Input value={settings.popup_subtitle ?? "Garanta um desconto exclusivo agora"} onChange={(e) => updateField("popup_subtitle", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Valor do Cupom (R$)</Label>
            <Input value={settings.popup_discount ?? "20"} onChange={(e) => updateField("popup_discount", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Texto do botão CTA</Label>
            <Input value={settings.popup_cta_text ?? "Quero falar no WhatsApp"} onChange={(e) => updateField("popup_cta_text", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* CTA Messages per button */}
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
              <Input id={field.key} value={settings[field.key] ?? field.default} onChange={(e) => updateField(field.key, e.target.value)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={() => saveKeys(allKeys, "WhatsApp e Botões salvos!")} disabled={saving} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar WhatsApp e Botões"}
      </Button>
    </div>
  );
};
