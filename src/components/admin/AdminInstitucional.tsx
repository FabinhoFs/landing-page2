import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Building, Plus, Trash2, Loader2 } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const DEFAULT_PROOFS = ["Operação online", "Experiência no mercado", "Processo estruturado", "Atendimento especializado"];

export const AdminInstitucional = () => {
  const { settings, fetching, saving, updateField, saveKeys } = useAdminSettings();

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const getItems = (): string[] => {
    const items: string[] = [];
    for (let i = 1; i <= 8; i++) {
      const val = settings[`authority_card_${i}`];
      if (val !== undefined && val !== "") items.push(val);
    }
    if (items.length > 0) return items;
    if (settings.authority_proofs) {
      try { return JSON.parse(settings.authority_proofs).map((p: any) => p.label || p); } catch {}
    }
    return DEFAULT_PROOFS;
  };
  const items = getItems();

  const allKeys = [
    "authority_title", "authority_subtitle",
    ...Array.from({ length: 8 }, (_, i) => `authority_card_${i + 1}`),
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building className="h-5 w-5 text-primary" />
            Institucional (Autoridade)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input value={settings.authority_title || ""} onChange={(e) => updateField("authority_title", e.target.value)} placeholder="Agis Digital: atendimento online..." />
          </div>
          <div className="space-y-1.5">
            <Label>Texto Institucional</Label>
            <Textarea value={settings.authority_subtitle || ""} onChange={(e) => updateField("authority_subtitle", e.target.value)} rows={3} placeholder="A Agis Digital atua com foco em..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2"><Building className="h-5 w-5 text-primary" />Mini-cards</span>
            <Button size="sm" variant="outline" onClick={() => updateField(`authority_card_${items.length + 1}`, "Novo card")}><Plus className="mr-1 h-4 w-4" />Adicionar</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">{i + 1}.</span>
              <Input value={settings[`authority_card_${i + 1}`] ?? item} onChange={(e) => updateField(`authority_card_${i + 1}`, e.target.value)} />
              <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => {
                for (let j = i + 1; j < items.length; j++) updateField(`authority_card_${j}`, items[j] || "");
                updateField(`authority_card_${items.length}`, "");
              }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={() => saveKeys(allKeys, "Institucional salvo!")} disabled={saving} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar Institucional"}
      </Button>
    </div>
  );
};
