import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, FileText, Loader2 } from "lucide-react";

interface SectionField {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  helpText?: string;
  type?: "text" | "switch";
}

interface SectionGroup {
  title: string;
  number: string;
  fields: SectionField[];
}

const SECTION_GROUPS: SectionGroup[] = [
  {
    number: "00",
    title: "Header (Cabeçalho Fixo)",
    fields: [
      { key: "header_cta_text", label: "Texto do Botão CTA", placeholder: "Iniciar emissão" },
    ],
  },
  {
    number: "02",
    title: "Dores",
    fields: [
      { key: "pain_title", label: "Título", placeholder: "Ficar sem Certificado Digital atrasa o que você precisa resolver hoje." },
      { key: "pain_subtitle", label: "Subtítulo / Texto de apoio", placeholder: "Resolva isso com um processo online...", multiline: true },
      { key: "pain_cta", label: "Texto do CTA", placeholder: "Quero falar no WhatsApp" },
      { key: "pain_items", label: "Lista de dores (JSON)", placeholder: '["Dor 1", "Dor 2", ...]', multiline: true, helpText: "Array JSON com os textos das dores. Ex: [\"Você não consegue emitir nota fiscal\", ...]" },
    ],
  },
  {
    number: "03",
    title: "Como Funciona",
    fields: [
      { key: "howitworks_title", label: "Título", placeholder: "Veja como funciona a emissão" },
      { key: "howitworks_subtitle", label: "Subtítulo", placeholder: "Você faz o processo online com orientação em cada etapa." },
      { key: "howitworks_compliance", label: "Frase de Compliance", placeholder: "O processo é realizado pelo titular...", multiline: true },
      { key: "howitworks_steps", label: "Etapas (JSON)", placeholder: '[{"title":"...","desc":"..."},...]', multiline: true, helpText: 'Array JSON com objetos {title, desc}. Ex: [{"title":"Escolha o certificado","desc":"Selecione..."}]' },
    ],
  },
  {
    number: "04",
    title: "Ofertas / Produtos",
    fields: [
      { key: "pricing_section_title", label: "Título da Seção", placeholder: "Escolha seu Certificado Digital e inicie sua emissão agora" },
      { key: "pricing_cpf_ideal", label: "e-CPF — Texto 'Ideal para'", placeholder: "Pessoa física, profissionais liberais...", multiline: true },
      { key: "pricing_cnpj_ideal", label: "e-CNPJ — Texto 'Ideal para'", placeholder: "Empresas que precisam emitir notas...", multiline: true },
      { key: "pricing_cpf_usos", label: "e-CPF — Usos (JSON)", placeholder: '["Assinatura digital","Acesso ao e-CAC",...]', multiline: true, helpText: "Array JSON com os principais usos do e-CPF." },
      { key: "pricing_cnpj_usos", label: "e-CNPJ — Usos (JSON)", placeholder: '["Emissão de notas fiscais","eSocial",...]', multiline: true, helpText: "Array JSON com os principais usos do e-CNPJ." },
      { key: "pricing_incluso", label: "Bloco 'Incluso' (JSON)", placeholder: '["Atendimento guiado no WhatsApp",...]', multiline: true, helpText: "Array JSON com itens do bloco Incluso, comum aos dois cards." },
      { key: "pricing_cta_cpf", label: "Texto CTA — Card e-CPF", placeholder: "Quero iniciar meu e-CPF A1" },
      { key: "pricing_cta_cnpj", label: "Texto CTA — Card e-CNPJ", placeholder: "Quero iniciar meu e-CNPJ A1" },
      { key: "pricing_micro", label: "Microtexto abaixo do botão", placeholder: "Atendimento guiado • Validação online • Suporte durante o processo" },
      { key: "support_text", label: "Frase de Suporte (abaixo dos cards)", placeholder: "Atendimento humano e orientação em todas as etapas do processo." },
    ],
  },
  {
    number: "05",
    title: "Diferenciais",
    fields: [
      { key: "benefits_title", label: "Título da Seção", placeholder: "Por que emitir com a Agis Digital" },
      { key: "benefits_items", label: "Cards de Diferenciais (JSON)", placeholder: '[{"title":"...","desc":"..."},...]', multiline: true, helpText: 'Array JSON com objetos {title, desc}.' },
    ],
  },
  {
    number: "06",
    title: "Prova Social (Depoimentos)",
    fields: [
      { key: "testimonials_title", label: "Título da Seção", placeholder: "O que nossos clientes dizem no Google" },
    ],
  },
  {
    number: "07",
    title: "Segurança para Contratar",
    fields: [
      { key: "guarantee_title", label: "Título", placeholder: "Mais segurança para você contratar" },
      { key: "guarantee_subtitle", label: "Descrição", placeholder: "Você conta com atendimento humano e orientação...", multiline: true },
      { key: "guarantee_cta", label: "Texto do CTA", placeholder: "Tirar dúvidas agora" },
      { key: "guarantee_points", label: "Pontos de segurança (JSON)", placeholder: '["Atendimento humano","Orientação",...]', multiline: true, helpText: "Array JSON com os pontos." },
    ],
  },
  {
    number: "08",
    title: "Institucional (Autoridade)",
    fields: [
      { key: "authority_title", label: "Título", placeholder: "Agis Digital: atendimento online..." },
      { key: "authority_subtitle", label: "Texto institucional", placeholder: "A Agis Digital atua com foco em Certificação Digital...", multiline: true },
      { key: "authority_proofs", label: "Mini-cards (JSON)", placeholder: '[{"label":"Operação online"},...]', multiline: true, helpText: 'Array JSON com objetos {label}.' },
    ],
  },
  {
    number: "09",
    title: "FAQ",
    fields: [
      { key: "faq_title", label: "Título da Seção", placeholder: "Perguntas Frequentes" },
      { key: "faq_bottom_text", label: "Texto abaixo do FAQ", placeholder: "Ainda tem dúvidas?" },
      { key: "faq_bottom_cta", label: "Texto do botão abaixo", placeholder: "Falar com um especialista" },
    ],
  },
  {
    number: "11",
    title: "CTA Final",
    fields: [
      { key: "cta_section_title", label: "Título", placeholder: "Inicie sua emissão hoje com atendimento imediato" },
      { key: "cta_section_subtitle", label: "Subtítulo", placeholder: "Fale com um especialista...", multiline: true },
      { key: "cta_section_button", label: "Texto do Botão", placeholder: "Quero iniciar minha emissão agora" },
      { key: "cta_section_micro", label: "Microtexto", placeholder: "Atendimento humano • Processo simples • Emissão com suporte especializado" },
      { key: "cta_section_bullets", label: "Bullets (JSON)", placeholder: '[{"text":"Processo online"},...]', multiline: true, helpText: 'Array JSON com objetos {text}.' },
    ],
  },
  {
    number: "13",
    title: "WhatsApp Flutuante",
    fields: [
      { key: "floating_whatsapp_enabled", label: "Exibir botão flutuante", type: "switch" },
    ],
  },
  {
    number: "—",
    title: "Barra Mobile Fixa",
    fields: [
      { key: "sticky_mobile_cta_text", label: "Texto do botão mobile", placeholder: "Iniciar minha emissão agora" },
    ],
  },
];

export const AdminSections = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("site_settings" as any).select("key, value");
      if (data) {
        const map: Record<string, string> = {};
        (data as any[]).forEach((r: any) => { map[r.key] = r.value; });
        setSettings(map);
      }
      setFetching(false);
    };
    fetchData();
  }, []);

  const updateField = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    const allKeys = SECTION_GROUPS.flatMap(g => g.fields.map(f => f.key));
    const payload = allKeys
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
    toast({ title: "Seções salvas!", description: "Todas as alterações já estão ativas na Landing Page." });
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {SECTION_GROUPS.map((group) => (
        <Card key={group.number + group.title}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-primary font-mono text-xs mr-1">{group.number}</span>
              {group.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {group.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                {field.type === "switch" ? (
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={settings[field.key] !== "false"}
                      onCheckedChange={(v) => updateField(field.key, v ? "true" : "false")}
                    />
                    <Label className="text-sm">{field.label}</Label>
                  </div>
                ) : field.multiline ? (
                  <>
                    <Label className="text-sm">{field.label}</Label>
                    <Textarea
                      value={settings[field.key] || ""}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  </>
                ) : (
                  <>
                    <Label className="text-sm">{field.label}</Label>
                    <Input
                      value={settings[field.key] || ""}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  </>
                )}
                {field.helpText && (
                  <p className="text-[11px] text-muted-foreground/70">{field.helpText}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />
        {loading ? "Salvando..." : "Salvar Todas as Seções"}
      </Button>
    </div>
  );
};
