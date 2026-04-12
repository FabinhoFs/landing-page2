import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Layout, CheckCircle2, RotateCcw, Plus, Trash2, Loader2 } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { IconPicker } from "./IconPicker";

const DEFAULT_LINE1_COLOR = "#F5F2FA";
const DEFAULT_LINE2_COLOR = "#6F2DBD";

const VARIANT_DEFAULTS: Record<string, Record<string, string>> = {
  "1": {
    badge: "Atendimento imediato",
    headline_line1: "Seu Certificado Digital",
    headline_line2: "pronto no mesmo dia.",
    subheadline: "Validação por videoconferência em poucos minutos, com atendimento humano do início ao fim.",
    dynamic_line: "Atendimento online para {{cidade}} e todo o Brasil.",
    fallback_line: "Atendimento online em todo o Brasil.",
    cta_primary: "Iniciar emissão",
    cta_secondary: "Falar com especialista",
    line1_color: DEFAULT_LINE1_COLOR,
    line2_color: DEFAULT_LINE2_COLOR,
  },
  "2": {
    badge: "Atendimento imediato",
    headline_line1: "Emita seu Certificado Digital online",
    headline_line2: "com atendimento imediato.",
    subheadline: "Faça sua validação por videoconferência e conclua sua emissão com suporte humano, em um processo simples e 100% online.",
    dynamic_line: "Atendimento para clientes de {{cidade}} e de todo o Brasil.",
    fallback_line: "Atendimento para clientes de todo o Brasil.",
    cta_primary: "Iniciar minha emissão",
    cta_secondary: "Falar com especialista",
    line1_color: DEFAULT_LINE1_COLOR,
    line2_color: DEFAULT_LINE2_COLOR,
  },
  "3": {
    badge: "Atendimento imediato",
    headline_line1: "Certificado Digital online",
    headline_line2: "com validação rápida.",
    subheadline: "Atendimento humano, processo simples e suporte em cada etapa da sua emissão.",
    dynamic_line: "Disponível para {{cidade}} e todo o Brasil.",
    fallback_line: "Disponível em todo o Brasil.",
    cta_primary: "Iniciar emissão agora",
    cta_secondary: "Quero falar no WhatsApp",
    line1_color: DEFAULT_LINE1_COLOR,
    line2_color: DEFAULT_LINE2_COLOR,
  },
};

const FIELDS = [
  { key: "badge", label: "Badge" },
  { key: "headline_line1", label: "Headline — Linha 1" },
  { key: "headline_line2", label: "Headline — Linha 2" },
  { key: "line1_color", label: "Cor Linha 1", type: "color" },
  { key: "line2_color", label: "Cor Linha 2", type: "color" },
  { key: "subheadline", label: "Subheadline", multiline: true },
  { key: "dynamic_line", label: "Linha dinâmica (com {{cidade}})" },
  { key: "fallback_line", label: "Fallback nacional (sem cidade)" },
  { key: "cta_primary", label: "CTA Principal" },
  { key: "cta_secondary", label: "CTA Secundário" },
];

const DEFAULT_BULLETS = [
  { icon: "MessageCircle", label: "Atendimento guiado no WhatsApp" },
  { icon: "Video", label: "Validação online sem sair de casa" },
  { icon: "Headphones", label: "Suporte humano em cada etapa" },
];

const DEFAULT_TRUST_LINE = "ICP-Brasil • Processo online • Atendimento humano";

export const AdminHero = () => {
  const { settings, fetching, saving, updateField, saveKeys } = useAdminSettings();

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const activeVariant = settings.hero_active_variant || "1";

  const getVal = (variant: string, field: string) => {
    return settings[`hero_v${variant}_${field}`] ?? VARIANT_DEFAULTS[variant]?.[field] ?? "";
  };

  const setVal = (variant: string, field: string, value: string) => {
    updateField(`hero_v${variant}_${field}`, value);
  };

  // Bullets as individual fields
  const getBullets = (): { icon: string; label: string }[] => {
    const items: { icon: string; label: string }[] = [];
    for (let i = 1; i <= 6; i++) {
      const label = settings[`hero_bullet_${i}_label`];
      if (label !== undefined && label !== "") {
        items.push({ icon: settings[`hero_bullet_${i}_icon`] || "MessageCircle", label });
      }
    }
    if (items.length > 0) return items;
    return DEFAULT_BULLETS;
  };
  const bullets = getBullets();

  const restoreColor = (variant: string, field: string) => {
    const defaultVal = field === "line1_color" ? DEFAULT_LINE1_COLOR : DEFAULT_LINE2_COLOR;
    setVal(variant, field, defaultVal);
  };

  const handleSave = async () => {
    const keys: string[] = ["hero_active_variant", "hero_trust_line", "hero_show_trust_line"];
    for (const v of ["1", "2", "3"]) {
      for (const f of FIELDS) keys.push(`hero_v${v}_${f.key}`);
    }
    for (let i = 1; i <= 6; i++) {
      keys.push(`hero_bullet_${i}_label`, `hero_bullet_${i}_icon`);
    }
    await saveKeys(keys, "Hero salva!");
  };

  return (
    <div className="space-y-6">
      {/* Active variant selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layout className="h-5 w-5 text-primary" />
            Variação Ativa da Hero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">Escolha qual variação será exibida na página pública.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["1", "2", "3"].map((v) => (
              <button key={v} onClick={() => updateField("hero_active_variant", v)}
                className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                  activeVariant === v ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"
                }`}>
                {activeVariant === v && <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-primary" />}
                <p className="text-sm font-bold text-foreground mb-1">Variação {v}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{getVal(v, "headline_line1")} {getVal(v, "headline_line2")}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editable fields for each variant */}
      {["1", "2", "3"].map((v) => (
        <Card key={v} className={activeVariant === v ? "ring-2 ring-primary" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layout className="h-5 w-5 text-primary" />
              Variação {v}
              {activeVariant === v && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">ATIVA</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {FIELDS.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-sm">{field.label}</Label>
                {field.type === "color" ? (
                  <div className="flex items-center gap-3">
                    <input type="color" value={getVal(v, field.key) || (field.key === "line1_color" ? DEFAULT_LINE1_COLOR : DEFAULT_LINE2_COLOR)}
                      onChange={(e) => setVal(v, field.key, e.target.value)}
                      className="h-10 w-14 rounded border border-border cursor-pointer" />
                    <Input value={getVal(v, field.key) || (field.key === "line1_color" ? DEFAULT_LINE1_COLOR : DEFAULT_LINE2_COLOR)}
                      onChange={(e) => setVal(v, field.key, e.target.value)}
                      className="w-32 font-mono text-sm" />
                    <Button size="sm" variant="ghost" onClick={() => restoreColor(v, field.key)} title="Restaurar cor padrão">
                      <RotateCcw className="h-4 w-4 mr-1" />Padrão
                    </Button>
                  </div>
                ) : field.multiline ? (
                  <Textarea value={getVal(v, field.key)} onChange={(e) => setVal(v, field.key, e.target.value)} rows={3} />
                ) : (
                  <Input value={getVal(v, field.key)} onChange={(e) => setVal(v, field.key, e.target.value)} />
                )}
                {field.key === "dynamic_line" && (
                  <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">{"{{cidade}}"}</code> para inserir a cidade detectada.</p>
                )}
              </div>
            ))}

            {/* Preview */}
            <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Pré-visualização do título:</p>
              <h3 className="text-xl font-extrabold leading-tight">
                <span style={{ color: getVal(v, "line1_color") || DEFAULT_LINE1_COLOR }}>{getVal(v, "headline_line1")}</span>
                <br />
                <span style={{ color: getVal(v, "line2_color") || DEFAULT_LINE2_COLOR }}>{getVal(v, "headline_line2")}</span>
              </h3>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Bullets with icon picker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2"><Layout className="h-5 w-5 text-primary" />Bullets de Confiança</span>
            <Button size="sm" variant="outline" onClick={() => {
              const next = bullets.length + 1;
              updateField(`hero_bullet_${next}_label`, "Novo bullet");
              updateField(`hero_bullet_${next}_icon`, "MessageCircle");
            }}><Plus className="mr-1 h-4 w-4" />Adicionar</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Ícones exibidos abaixo do título da hero. Clique no ícone para trocar.</p>
          {bullets.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <IconPicker
                value={settings[`hero_bullet_${i + 1}_icon`] ?? b.icon}
                onChange={(iconName) => updateField(`hero_bullet_${i + 1}_icon`, iconName)}
              />
              <Input value={settings[`hero_bullet_${i + 1}_label`] ?? b.label}
                onChange={(e) => updateField(`hero_bullet_${i + 1}_label`, e.target.value)}
                className="flex-1" />
              <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => {
                for (let j = i + 1; j < bullets.length; j++) {
                  updateField(`hero_bullet_${j}_label`, bullets[j]?.label || "");
                  updateField(`hero_bullet_${j}_icon`, bullets[j]?.icon || "MessageCircle");
                }
                updateField(`hero_bullet_${bullets.length}_label`, "");
                updateField(`hero_bullet_${bullets.length}_icon`, "");
              }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Trust line */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Linha de Confiança (abaixo dos CTAs)
            <div className="flex items-center gap-2">
              <Label htmlFor="show_trust_line" className="text-sm font-normal text-muted-foreground">Exibir</Label>
              <Switch id="show_trust_line" checked={settings.hero_show_trust_line !== "false"} onCheckedChange={(v) => updateField("hero_show_trust_line", v ? "true" : "false")} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input value={settings.hero_trust_line ?? DEFAULT_TRUST_LINE} onChange={(e) => updateField("hero_trust_line", e.target.value)} />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar Hero"}
      </Button>
    </div>
  );
};
