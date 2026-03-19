import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Save, Award, Users,
  Headphones, ShieldCheck, Clock, Zap, Target, Lock,
  FastForward, HeadphonesIcon, Rocket, Star, Heart,
  CheckCircle, Globe, Eye, Sparkles, Shield,
  Award as AwardIcon, Fingerprint, FileCheck, UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: "FastForward", icon: FastForward },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Headphones", icon: Headphones },
  { name: "HeadphonesIcon", icon: HeadphonesIcon },
  { name: "Lock", icon: Lock },
  { name: "Clock", icon: Clock },
  { name: "Zap", icon: Zap },
  { name: "Target", icon: Target },
  { name: "Rocket", icon: Rocket },
  { name: "Star", icon: Star },
  { name: "Heart", icon: Heart },
  { name: "CheckCircle", icon: CheckCircle },
  { name: "Globe", icon: Globe },
  { name: "Eye", icon: Eye },
  { name: "Sparkles", icon: Sparkles },
  { name: "Shield", icon: Shield },
  { name: "Award", icon: AwardIcon },
  { name: "Fingerprint", icon: Fingerprint },
  { name: "FileCheck", icon: FileCheck },
  { name: "UserCheck", icon: UserCheck },
];

const SOCIAL_FIELDS = [
  { key: "social_experience_text", label: "Ícone 1 — Certificação", hint: "📍 Ícone: Escudo — 1ª posição da barra" },
  { key: "social_authority_title", label: "Ícone 2 — Rapidez", hint: "📍 Ícone: Raio — 2ª posição da barra" },
  { key: "social_proof_text", label: "Ícone 3 — Prova Social", hint: "📍 Ícone: Pessoas — 3ª posição da barra" },
  { key: "social_support_text", label: "Ícone 4 — Suporte", hint: "📍 Ícone: Headset — 4ª posição da barra" },
];

const BENEFITS_FIELDS = [
  { titleKey: "benefit_1_title", descKey: "benefit_1_desc", iconKey: "diff_1_icon", label: "Diferencial 1" },
  { titleKey: "benefit_2_title", descKey: "benefit_2_desc", iconKey: "diff_2_icon", label: "Diferencial 2" },
  { titleKey: "benefit_3_title", descKey: "benefit_3_desc", iconKey: "diff_3_icon", label: "Diferencial 3" },
  { titleKey: "benefit_4_title", descKey: "benefit_4_desc", iconKey: "diff_4_icon", label: "Diferencial 4" },
];

const DEFAULT_ICONS = ["FastForward", "ShieldCheck", "HeadphonesIcon", "Lock"];

export const AdminDiferenciais = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      if (data) {
        const map: Record<string, string> = {};
        (data as any[]).forEach((r: any) => { map[r.key] = r.value; });
        // Set default icons if not saved
        BENEFITS_FIELDS.forEach((f, i) => {
          if (!map[f.iconKey]) map[f.iconKey] = DEFAULT_ICONS[i];
        });
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
    const allKeys = [
      ...SOCIAL_FIELDS.map(f => f.key),
      ...BENEFITS_FIELDS.flatMap(f => [f.titleKey, f.descKey, f.iconKey]),
    ];
    const payload = allKeys
      .filter(k => settings[k] !== undefined)
      .map((key) => ({ key, value: settings[key], updated_at: new Date().toISOString() }));

    if (payload.length > 0) {
      const { error } = await supabase.from("site_settings").upsert(payload as any, { onConflict: "key" });
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
    }
    toast({ title: "Diferenciais salvos!", description: "As alterações já estão ativas." });
    setLoading(false);
  };

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
          {SOCIAL_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label>{field.label}</Label>
              <Input
                value={settings[field.key] || ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder="Texto do ícone..."
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
            Estes são os 4 blocos de diferenciais exibidos na seção com imagem ao lado. Selecione o ícone e edite os textos.
          </p>
          {BENEFITS_FIELDS.map((field, idx) => {
            const selectedIcon = settings[field.iconKey] || DEFAULT_ICONS[idx];
            return (
              <div key={field.titleKey} className="space-y-3 border-b border-border pb-4 last:border-0">
                <Label className="font-semibold">{field.label}</Label>

                {/* Icon Picker */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Ícone</Label>
                  <div className="grid grid-cols-10 gap-1.5">
                    {ICON_OPTIONS.map((opt) => {
                      const isSelected = selectedIcon === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          title={opt.name}
                          onClick={() => updateField(field.iconKey, opt.name)}
                          className={`flex items-center justify-center rounded-lg p-2 transition-all border ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                              : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                          }`}
                        >
                          <opt.icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground/60">
                    Selecionado: <code className="bg-muted px-1 rounded">{selectedIcon}</code>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Título</Label>
                  <Input
                    value={settings[field.titleKey] || ""}
                    onChange={(e) => updateField(field.titleKey, e.target.value)}
                    placeholder="Título do diferencial"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Descrição</Label>
                  <Textarea
                    value={settings[field.descKey] || ""}
                    onChange={(e) => updateField(field.descKey, e.target.value)}
                    rows={2}
                    placeholder="Descrição do diferencial..."
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />
        {loading ? "Salvando..." : "Salvar Diferenciais"}
      </Button>
    </div>
  );
};
