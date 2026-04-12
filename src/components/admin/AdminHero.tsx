import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Layout, CheckCircle2 } from "lucide-react";

const VARIANT_DEFAULTS: Record<string, Record<string, string>> = {
  "1": {
    badge: "Atendimento imediato",
    headline: "Seu Certificado Digital\npronto no mesmo dia.",
    subheadline: "Validação por videoconferência em poucos minutos, com atendimento humano do início ao fim.",
    dynamic_line: "Atendimento online para {{cidade}} e todo o Brasil.",
    fallback_line: "Atendimento online em todo o Brasil.",
    cta_primary: "Iniciar emissão",
    cta_secondary: "Falar com especialista",
  },
  "2": {
    badge: "Atendimento imediato",
    headline: "Emita seu Certificado Digital online\ncom atendimento imediato.",
    subheadline: "Faça sua validação por videoconferência e conclua sua emissão com suporte humano, em um processo simples e 100% online.",
    dynamic_line: "Atendimento para clientes de {{cidade}} e de todo o Brasil.",
    fallback_line: "Atendimento para clientes de todo o Brasil.",
    cta_primary: "Iniciar minha emissão",
    cta_secondary: "Falar com especialista",
  },
  "3": {
    badge: "Atendimento imediato",
    headline: "Certificado Digital online\ncom validação rápida.",
    subheadline: "Atendimento humano, processo simples e suporte em cada etapa da sua emissão.",
    dynamic_line: "Disponível para {{cidade}} e todo o Brasil.",
    fallback_line: "Disponível em todo o Brasil.",
    cta_primary: "Iniciar emissão agora",
    cta_secondary: "Quero falar no WhatsApp",
  },
};

const FIELDS = [
  { key: "badge", label: "Badge", placeholder: "Atendimento imediato" },
  { key: "headline", label: "Headline (título principal)", placeholder: "Seu Certificado Digital...", multiline: true },
  { key: "subheadline", label: "Subheadline", placeholder: "Validação por videoconferência...", multiline: true },
  { key: "dynamic_line", label: "Linha dinâmica (com {{cidade}})", placeholder: "Atendimento online para {{cidade}} e todo o Brasil." },
  { key: "fallback_line", label: "Fallback nacional (sem cidade)", placeholder: "Atendimento online em todo o Brasil." },
  { key: "cta_primary", label: "CTA Principal", placeholder: "Iniciar emissão" },
  { key: "cta_secondary", label: "CTA Secundário", placeholder: "Falar com especialista" },
];

export const AdminHero = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("site_settings" as any).select("key, value");
      if (data) {
        const map: Record<string, string> = {};
        (data as any[]).forEach((r: any) => { map[r.key] = r.value; });
        setSettings(map);
      }
    };
    fetchData();
  }, []);

  const activeVariant = settings.hero_active_variant || "1";

  const updateField = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const getVal = (variant: string, field: string) => {
    return settings[`hero_v${variant}_${field}`] ?? VARIANT_DEFAULTS[variant]?.[field] ?? "";
  };

  const setVal = (variant: string, field: string, value: string) => {
    updateField(`hero_v${variant}_${field}`, value);
  };

  const handleSave = async () => {
    setLoading(true);

    // Collect all hero keys
    const keys: string[] = ["hero_active_variant"];
    for (const v of ["1", "2", "3"]) {
      for (const f of FIELDS) {
        keys.push(`hero_v${v}_${f.key}`);
      }
    }

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
      {/* Active variant selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layout className="h-5 w-5 text-primary" />
            Variação Ativa da Hero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Escolha qual variação será exibida na página pública. Apenas uma variação fica ativa por vez.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["1", "2", "3"].map((v) => (
              <button
                key={v}
                onClick={() => updateField("hero_active_variant", v)}
                className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                  activeVariant === v
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {activeVariant === v && (
                  <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-primary" />
                )}
                <p className="text-sm font-bold text-foreground mb-1">Variação {v}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {getVal(v, "headline").replace(/\n/g, " ")}
                </p>
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
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  ATIVA
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {FIELDS.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-sm">{field.label}</Label>
                {field.multiline ? (
                  <Textarea
                    value={getVal(v, field.key)}
                    onChange={(e) => setVal(v, field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                ) : (
                  <Input
                    value={getVal(v, field.key)}
                    onChange={(e) => setVal(v, field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                )}
                {field.key === "dynamic_line" && (
                  <p className="text-xs text-muted-foreground">
                    Use <code className="bg-muted px-1 rounded">{"{{cidade}}"}</code> para inserir a cidade detectada.
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />
        {loading ? "Salvando..." : "Salvar Hero"}
      </Button>
    </div>
  );
};
