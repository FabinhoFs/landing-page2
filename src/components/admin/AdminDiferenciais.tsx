import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Award, Users, Loader2 } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { IconPicker } from "./IconPicker";

const SOCIAL_DEFAULTS = [
  { key: "social_experience_text", label: "Ícone 1 — Certificação", hint: "📍 1ª posição da barra", default: "Certificação ICP-Brasil" },
  { key: "social_authority_title", label: "Ícone 2 — Rapidez", hint: "📍 2ª posição da barra", default: "Emissão rápida" },
  { key: "social_proof_text", label: "Ícone 3 — Prova Social", hint: "📍 3ª posição da barra", default: "Clientes atendidos" },
  { key: "social_support_text", label: "Ícone 4 — Suporte", hint: "📍 4ª posição da barra", default: "Suporte humano" },
];

const BENEFITS_FIELDS = [
  { titleKey: "benefit_1_title", descKey: "benefit_1_desc", iconKey: "diff_1_icon", label: "Diferencial 1", defaultTitle: "Atendimento imediato", defaultDesc: "Você fala com uma equipe preparada para orientar seu processo com mais agilidade.", defaultIcon: "FastForward" },
  { titleKey: "benefit_2_title", descKey: "benefit_2_desc", iconKey: "diff_2_icon", label: "Diferencial 2", defaultTitle: "Suporte do início ao fim", defaultDesc: "Nossa equipe acompanha cada etapa para reduzir dúvidas, erro e retrabalho.", defaultIcon: "ShieldCheck" },
  { titleKey: "benefit_3_title", descKey: "benefit_3_desc", iconKey: "diff_3_icon", label: "Diferencial 3", defaultTitle: "Validação online com praticidade", defaultDesc: "Você realiza a validação por videoconferência, com mais comodidade e segurança.", defaultIcon: "Headphones" },
  { titleKey: "benefit_4_title", descKey: "benefit_4_desc", iconKey: "diff_4_icon", label: "Diferencial 4", defaultTitle: "Processo seguro e homologado", defaultDesc: "A emissão segue um fluxo estruturado, com foco em conformidade, segurança e clareza.", defaultIcon: "Lock" },
];

export const AdminDiferenciais = () => {
  const { settings, fetching, saving, updateField, saveKeys } = useAdminSettings();

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const allKeys = [
    ...SOCIAL_DEFAULTS.map(f => f.key),
    ...BENEFITS_FIELDS.flatMap(f => [f.titleKey, f.descKey, f.iconKey]),
  ];

  return (
    <div className="space-y-6">
      {/* Barra de Prova Social */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-primary" />
            Barra de Prova Social (abaixo do Hero)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-xs text-muted-foreground">
            Estas frases aparecem na barra de ícones logo abaixo do topo da página.
          </p>
          {SOCIAL_DEFAULTS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label>{field.label}</Label>
              <Input
                value={settings[field.key] ?? field.default}
                onChange={(e) => updateField(field.key, e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{field.hint}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Seção "Por que Escolher" */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-5 w-5 text-primary" />
            Seção "Por que Escolher a Agis" (Diferenciais)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-muted-foreground">
            Estes são os 4 blocos de diferenciais exibidos na seção com imagem ao lado. Clique no ícone para trocar.
          </p>
          {BENEFITS_FIELDS.map((field) => (
            <div key={field.titleKey} className="space-y-3 border-b border-border pb-4 last:border-0">
              <Label className="font-semibold">{field.label}</Label>

              {/* Icon Picker */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Ícone</Label>
                <IconPicker
                  value={settings[field.iconKey] ?? field.defaultIcon}
                  onChange={(iconName) => updateField(field.iconKey, iconName)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Título</Label>
                <Input
                  value={settings[field.titleKey] ?? field.defaultTitle}
                  onChange={(e) => updateField(field.titleKey, e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Descrição</Label>
                <Textarea
                  value={settings[field.descKey] ?? field.defaultDesc}
                  onChange={(e) => updateField(field.descKey, e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={() => saveKeys(allKeys, "Diferenciais salvos!")} disabled={saving} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />
        {saving ? "Salvando..." : "Salvar Diferenciais"}
      </Button>
    </div>
  );
};
