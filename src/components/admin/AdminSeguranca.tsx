import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, ShieldCheck, Plus, Trash2, Loader2 } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const DEFAULT_TITLE = "Mais segurança para você contratar";
const DEFAULT_SUBTITLE = "Você conta com atendimento humano e orientação em todas as etapas do processo. Nossa equipe esclarece dúvidas, explica o fluxo e acompanha você com mais segurança e clareza.";
const DEFAULT_CTA = "Tirar dúvidas agora";
const DEFAULT_POINTS = [
  "Atendimento humano durante o processo",
  "Orientação para seguir corretamente cada etapa",
  "Mais segurança para contratar com clareza",
];

export const AdminSeguranca = () => {
  const { settings, fetching, saving, updateField, saveKeys } = useAdminSettings();

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const getItems = (): string[] => {
    const items: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const val = settings[`guarantee_point_${i}`];
      if (val !== undefined && val !== "") items.push(val);
    }
    return items.length > 0 ? items : DEFAULT_POINTS;
  };
  const items = getItems();

  const allKeys = [
    "guarantee_title", "guarantee_subtitle", "guarantee_cta",
    ...Array.from({ length: 10 }, (_, i) => `guarantee_point_${i + 1}`),
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Segurança para Contratar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input value={settings.guarantee_title ?? DEFAULT_TITLE} onChange={(e) => updateField("guarantee_title", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea value={settings.guarantee_subtitle ?? DEFAULT_SUBTITLE} onChange={(e) => updateField("guarantee_subtitle", e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Texto do CTA</Label>
            <Input value={settings.guarantee_cta ?? DEFAULT_CTA} onChange={(e) => updateField("guarantee_cta", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />Pontos de Segurança</span>
            <Button size="sm" variant="outline" onClick={() => updateField(`guarantee_point_${items.length + 1}`, "Novo ponto")}><Plus className="mr-1 h-4 w-4" />Adicionar</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">{i + 1}.</span>
              <Input value={settings[`guarantee_point_${i + 1}`] ?? item} onChange={(e) => updateField(`guarantee_point_${i + 1}`, e.target.value)} />
              <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => {
                for (let j = i + 1; j < items.length; j++) updateField(`guarantee_point_${j}`, items[j] || "");
                updateField(`guarantee_point_${items.length}`, "");
              }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={() => saveKeys(allKeys, "Segurança salva!")} disabled={saving} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar Segurança"}
      </Button>
    </div>
  );
};
