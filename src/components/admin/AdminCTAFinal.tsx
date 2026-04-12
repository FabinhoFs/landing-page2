import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Megaphone, Plus, Trash2, Loader2 } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const DEFAULT_TITLE = "Inicie sua emissão hoje com atendimento imediato";
const DEFAULT_SUBTITLE = "Fale com um especialista, escolha o certificado certo e conclua seu processo com mais clareza, suporte humano e praticidade.";
const DEFAULT_BUTTON = "Quero iniciar minha emissão agora";
const DEFAULT_MICRO = "Atendimento humano • Processo simples • Emissão com suporte especializado";
const DEFAULT_BULLETS = ["Processo online", "Validação rápida", "Atendimento no WhatsApp"];

export const AdminCTAFinal = () => {
  const { settings, fetching, saving, updateField, saveKeys } = useAdminSettings();

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const getItems = (): string[] => {
    const items: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const val = settings[`cta_bullet_${i}`];
      if (val !== undefined && val !== "") items.push(val);
    }
    return items.length > 0 ? items : DEFAULT_BULLETS;
  };
  const items = getItems();

  const allKeys = [
    "cta_section_title", "cta_section_subtitle", "cta_section_button", "cta_section_micro",
    ...Array.from({ length: 6 }, (_, i) => `cta_bullet_${i + 1}`),
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="h-5 w-5 text-primary" />
            CTA Final
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input value={settings.cta_section_title ?? DEFAULT_TITLE} onChange={(e) => updateField("cta_section_title", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Subtítulo</Label>
            <Textarea value={settings.cta_section_subtitle ?? DEFAULT_SUBTITLE} onChange={(e) => updateField("cta_section_subtitle", e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Texto do Botão</Label>
            <Input value={settings.cta_section_button ?? DEFAULT_BUTTON} onChange={(e) => updateField("cta_section_button", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Microtexto</Label>
            <Input value={settings.cta_section_micro ?? DEFAULT_MICRO} onChange={(e) => updateField("cta_section_micro", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" />Bullets</span>
            <Button size="sm" variant="outline" onClick={() => updateField(`cta_bullet_${items.length + 1}`, "Novo bullet")}><Plus className="mr-1 h-4 w-4" />Adicionar</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">{i + 1}.</span>
              <Input value={settings[`cta_bullet_${i + 1}`] ?? item} onChange={(e) => updateField(`cta_bullet_${i + 1}`, e.target.value)} />
              <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => {
                for (let j = i + 1; j < items.length; j++) updateField(`cta_bullet_${j}`, items[j] || "");
                updateField(`cta_bullet_${items.length}`, "");
              }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={() => saveKeys(allKeys, "CTA Final salvo!")} disabled={saving} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar CTA Final"}
      </Button>
    </div>
  );
};
