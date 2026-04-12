import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, AlertTriangle, Plus, Trash2, Loader2 } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const DEFAULT_TITLE = "Ficar sem Certificado Digital atrasa o que você precisa resolver hoje.";
const DEFAULT_SUBTITLE = "Resolva isso com um processo online, validado e acompanhado por atendimento especializado.";
const DEFAULT_CTA = "Quero falar no WhatsApp";
const DEFAULT_PAINS = [
  "Você não consegue emitir nota fiscal",
  "Fica sem acesso a sistemas oficiais",
  "Atrasa obrigações fiscais e operacionais",
  "Não consegue assinar documentos com validade",
  "Perde tempo com burocracia e atendimento lento",
  "Fica dependente de terceiros para resolver algo urgente",
];

export const AdminDores = () => {
  const { settings, fetching, saving, updateField, saveKeys, setSettings } = useAdminSettings();
  const seeded = useRef(false);

  // Seed defaults into settings once after fetching
  useEffect(() => {
    if (!fetching && !seeded.current) {
      seeded.current = true;
      const hasAny = Array.from({ length: 10 }, (_, i) => settings[`pain_item_${i + 1}`]).some(v => v !== undefined && v !== "");
      if (!hasAny) {
        setSettings(prev => {
          const next = { ...prev };
          DEFAULT_PAINS.forEach((p, idx) => { next[`pain_item_${idx + 1}`] = p; });
          return next;
        });
      }
    }
  }, [fetching]);

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const getItems = (): string[] => {
    const items: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const val = settings[`pain_item_${i}`];
      if (val !== undefined && val !== "") items.push(val);
    }
    return items.length > 0 ? items : DEFAULT_PAINS;
  };

  const items = getItems();

  const updateItem = (index: number, value: string) => {
    updateField(`pain_item_${index + 1}`, value);
  };

  const addItem = () => {
    const nextIndex = items.length + 1;
    updateField(`pain_item_${nextIndex}`, "Nova dor");
  };

  const removeItem = (index: number) => {
    for (let i = index + 1; i < items.length; i++) {
      updateField(`pain_item_${i}`, items[i] || "");
    }
    updateField(`pain_item_${items.length}`, "");
  };

  const allKeys = [
    "pain_title", "pain_subtitle", "pain_cta",
    ...Array.from({ length: 10 }, (_, i) => `pain_item_${i + 1}`),
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Seção de Dores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input value={settings.pain_title ?? DEFAULT_TITLE} onChange={(e) => updateField("pain_title", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Subtítulo / Texto de apoio</Label>
            <Textarea value={settings.pain_subtitle ?? DEFAULT_SUBTITLE} onChange={(e) => updateField("pain_subtitle", e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Texto do CTA</Label>
            <Input value={settings.pain_cta ?? DEFAULT_CTA} onChange={(e) => updateField("pain_cta", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-primary" />Lista de Dores</span>
            <Button size="sm" variant="outline" onClick={addItem}><Plus className="mr-1 h-4 w-4" />Adicionar</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground w-6 shrink-0">{i + 1}.</span>
              <Input value={settings[`pain_item_${i + 1}`] ?? item} onChange={(e) => updateItem(i, e.target.value)} />
              <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={() => saveKeys(allKeys, "Dores salvas!", "dores")} disabled={saving} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar Dores"}
      </Button>
    </div>
  );
};
