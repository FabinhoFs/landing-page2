import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, FileText } from "lucide-react";

const SECTION_FIELDS = [
  // Pain
  { key: "pain_title", label: "Dores — Título", section: "Bloco de Dores" },
  { key: "pain_subtitle", label: "Dores — Subtítulo", section: "Bloco de Dores" },
  { key: "pain_cta", label: "Dores — Texto do CTA", section: "Bloco de Dores" },
  // How it works
  { key: "howitworks_title", label: "Como Funciona — Título", section: "Como Funciona" },
  { key: "howitworks_subtitle", label: "Como Funciona — Subtítulo", section: "Como Funciona" },
  { key: "howitworks_compliance", label: "Como Funciona — Frase de Compliance", section: "Como Funciona" },
  // Benefits
  { key: "benefits_title", label: "Diferenciais — Título da Seção", section: "Diferenciais" },
  // Guarantee
  { key: "guarantee_title", label: "Segurança — Título", section: "Segurança para Contratar" },
  { key: "guarantee_subtitle", label: "Segurança — Subtítulo", section: "Segurança para Contratar", multiline: true },
  { key: "guarantee_cta", label: "Segurança — Texto do CTA", section: "Segurança para Contratar" },
  // Authority
  { key: "authority_title", label: "Autoridade — Título", section: "Autoridade" },
  { key: "authority_subtitle", label: "Autoridade — Subtítulo", section: "Autoridade", multiline: true },
  // CTA final
  { key: "cta_section_title", label: "CTA Final — Título", section: "CTA Final" },
  { key: "cta_section_subtitle", label: "CTA Final — Subtítulo", section: "CTA Final", multiline: true },
  { key: "cta_section_button", label: "CTA Final — Texto do Botão", section: "CTA Final" },
  { key: "cta_section_micro", label: "CTA Final — Microtexto", section: "CTA Final" },
];

export const AdminSections = () => {
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

  const updateField = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    const keys = SECTION_FIELDS.map(f => f.key);
    const payload = keys
      .filter(k => settings[k] !== undefined)
      .map(key => ({ key, value: settings[key], updated_at: new Date().toISOString() }));

    if (payload.length > 0) {
      const { error } = await supabase.from("site_settings" as any).upsert(payload as any, { onConflict: "key" });
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
    }
    toast({ title: "Seções salvas!", description: "As alterações já estão ativas na Landing Page." });
    setLoading(false);
  };

  // Group by section
  const sections = SECTION_FIELDS.reduce<Record<string, typeof SECTION_FIELDS>>((acc, f) => {
    if (!acc[f.section]) acc[f.section] = [];
    acc[f.section].push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(sections).map(([sectionName, fields]) => (
        <Card key={sectionName}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-primary" />
              {sectionName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-sm">{field.label}</Label>
                {(field as any).multiline ? (
                  <Textarea
                    value={settings[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    rows={3}
                  />
                ) : (
                  <Input
                    value={settings[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  />
                )}
                <p className="text-[11px] text-muted-foreground/60">
                  Chave: <code className="bg-muted px-1 rounded">{field.key}</code>
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />
        {loading ? "Salvando..." : "Salvar Seções"}
      </Button>
    </div>
  );
};
