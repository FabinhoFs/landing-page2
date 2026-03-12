import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, Layout } from "lucide-react";

export const AdminHero = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings" as any).select("key, value");
      if (data) {
        const map: Record<string, string> = {};
        (data as any[]).forEach((r: any) => { map[r.key] = r.value; });
        setSettings(map);
      }
    };
    fetch();
  }, []);

  const updateField = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    const keys = ["hero_title", "hero_highlight", "hero_subtitle_detected", "hero_subtitle_fallback", "hero_button_primary", "hero_button_secondary", "hero_micro_text"];
    const payload = keys
      .filter(k => settings[k] !== undefined)
      .map((key) => ({ key, value: settings[key], updated_at: new Date().toISOString() }));

    if (payload.length > 0) {
      const { error } = await supabase.from("site_settings" as any).upsert(payload as any, { onConflict: "key" });
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
    }
    toast({ title: "Hero salvo!", description: "As alterações já estão ativas na Landing Page." });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layout className="h-5 w-5 text-primary" />
            Seção Hero — Topo da Página
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label>Título Principal</Label>
            <Input
              value={settings.hero_title || ""}
              onChange={(e) => updateField("hero_title", e.target.value)}
              placeholder="Seu Certificado Digital"
            />
            <p className="text-xs text-muted-foreground">📍 Primeira linha do título no topo</p>
          </div>

          <div className="space-y-1.5">
            <Label>Destaque do Título (em cor)</Label>
            <Input
              value={settings.hero_highlight || ""}
              onChange={(e) => updateField("hero_highlight", e.target.value)}
              placeholder="pronto no mesmo dia."
            />
            <p className="text-xs text-muted-foreground">📍 Parte colorida do título</p>
          </div>

          <div className="space-y-1.5">
            <Label>Subtítulo — Cidade Detectada</Label>
            <Input
              value={settings.hero_subtitle_detected || ""}
              onChange={(e) => updateField("hero_subtitle_detected", e.target.value)}
              placeholder="Videoconferência em menos de 5 minutos para você de {cidade} e região. Sem filas e 100% online."
            />
            <p className="text-xs text-muted-foreground">
              📍 Exibido quando a cidade é detectada. Use <code className="bg-muted px-1 rounded">{"{cidade}"}</code> para inserir o nome da cidade.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Subtítulo — Fallback (sem cidade)</Label>
            <Input
              value={settings.hero_subtitle_fallback || ""}
              onChange={(e) => updateField("hero_subtitle_fallback", e.target.value)}
              placeholder="Emissão de certificados com validade jurídica e atendimento simplificado em todo o território nacional."
            />
            <p className="text-xs text-muted-foreground">📍 Exibido quando a cidade não é detectada</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Texto Botão Principal</Label>
              <Input
                value={settings.hero_button_primary || ""}
                onChange={(e) => updateField("hero_button_primary", e.target.value)}
                placeholder="Emitir em 5 minutos"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Texto Botão Secundário</Label>
              <Input
                value={settings.hero_button_secondary || ""}
                onChange={(e) => updateField("hero_button_secondary", e.target.value)}
                placeholder="Quero meu certificado agora"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Micro-texto abaixo dos botões</Label>
            <Input
              value={settings.hero_micro_text || ""}
              onChange={(e) => updateField("hero_micro_text", e.target.value)}
              placeholder="✨ Atendimento imediato via videoconferência"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />
        {loading ? "Salvando..." : "Salvar Hero"}
      </Button>
    </div>
  );
};
