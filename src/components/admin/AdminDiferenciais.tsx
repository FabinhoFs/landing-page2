import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Award, Users, Loader2, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { IconPicker } from "./IconPicker";

interface SocialItem {
  icon: string;
  text: string;
}

const DEFAULT_SOCIAL_ITEMS: SocialItem[] = [
  { icon: "ShieldCheck", text: "Emissão oficial ICP-Brasil" },
  { icon: "Zap", text: "Rapidez e Segurança" },
  { icon: "Users", text: "Junte-se a quem confia em nossa emissão oficial." },
  { icon: "Headphones", text: "Suporte completo e humanizado: em caso de qualquer dúvida, conte conosco do início ao fim." },
];

const BENEFITS_FIELDS = [
  { titleKey: "benefit_1_title", descKey: "benefit_1_desc", iconKey: "diff_1_icon", label: "Diferencial 1", defaultTitle: "Atendimento imediato", defaultDesc: "Você fala com uma equipe preparada para orientar seu processo com mais agilidade.", defaultIcon: "FastForward" },
  { titleKey: "benefit_2_title", descKey: "benefit_2_desc", iconKey: "diff_2_icon", label: "Diferencial 2", defaultTitle: "Suporte do início ao fim", defaultDesc: "Nossa equipe acompanha cada etapa para reduzir dúvidas, erro e retrabalho.", defaultIcon: "ShieldCheck" },
  { titleKey: "benefit_3_title", descKey: "benefit_3_desc", iconKey: "diff_3_icon", label: "Diferencial 3", defaultTitle: "Validação online com praticidade", defaultDesc: "Você realiza a validação por videoconferência, com mais comodidade e segurança.", defaultIcon: "Headphones" },
  { titleKey: "benefit_4_title", descKey: "benefit_4_desc", iconKey: "diff_4_icon", label: "Diferencial 4", defaultTitle: "Processo seguro e homologado", defaultDesc: "A emissão segue um fluxo estruturado, com foco em conformidade, segurança e clareza.", defaultIcon: "Lock" },
];

export const AdminDiferenciais = () => {
  const { settings, fetching, saving, updateField, saveKeys, setSettings } = useAdminSettings();

  // Parse social proof items from settings or use defaults
  const getSocialItems = (): SocialItem[] => {
    if (settings.social_proof_items) {
      try {
        const parsed = JSON.parse(settings.social_proof_items);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_SOCIAL_ITEMS;
  };

  const [socialItems, setSocialItems] = useState<SocialItem[] | null>(null);

  // Initialize from settings once loaded
  const items = socialItems ?? getSocialItems();

  const updateSocialItems = (newItems: SocialItem[]) => {
    setSocialItems(newItems);
    updateField("social_proof_items", JSON.stringify(newItems));
  };

  const addItem = () => {
    updateSocialItems([...items, { icon: "Star", text: "Novo bloco" }]);
  };

  const removeItem = (index: number) => {
    updateSocialItems(items.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const newItems = [...items];
    const target = index + direction;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    updateSocialItems(newItems);
  };

  const updateItem = (index: number, field: keyof SocialItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    updateSocialItems(newItems);
  };

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const allKeys = [
    "social_proof_items",
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
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Blocos de confiança exibidos logo abaixo do Hero. Adicione, remova ou reordene livremente.
          </p>

          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-3 border border-border rounded-xl p-4 bg-muted/30">
              <div className="flex flex-col gap-1 pt-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Ícone</Label>
                  <IconPicker value={item.icon} onChange={(v) => updateItem(index, "icon", v)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Texto</Label>
                  <Input value={item.text} onChange={(e) => updateItem(index, "text", e.target.value)} />
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive shrink-0 mt-1" onClick={() => removeItem(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Bloco
          </Button>
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
