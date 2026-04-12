import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, ListChecks, Loader2 } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const DEFAULT_TITLE = "Veja como funciona a emissão";
const DEFAULT_SUBTITLE = "Você faz o processo online com orientação em cada etapa.";
const DEFAULT_COMPLIANCE = "O processo é realizado pelo titular ou responsável pelo certificado, com orientação especializada do início ao fim.";
const DEFAULT_STEPS = [
  { title: "Escolha o certificado ideal", desc: "Selecione o e-CPF A1 ou e-CNPJ A1 conforme sua necessidade." },
  { title: "Envie os dados e documentos necessários", desc: "Nossa equipe orienta o que é preciso para seguir corretamente." },
  { title: "Faça a validação por videoconferência", desc: "A validação acontece online, com segurança e confirmação das informações exigidas." },
  { title: "Conclua sua emissão", desc: "Após a validação e aprovação do processo, você conclui sua emissão com suporte da nossa equipe." },
];

export const AdminComoFunciona = () => {
  const { settings, fetching, saving, updateField, saveKeys } = useAdminSettings();

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const allKeys = [
    "howitworks_title", "howitworks_subtitle", "howitworks_compliance",
    ...Array.from({ length: 4 }, (_, i) => [`step_${i + 1}_title`, `step_${i + 1}_desc`]).flat(),
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-5 w-5 text-primary" />
            Como Funciona — Textos Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input value={settings.howitworks_title ?? DEFAULT_TITLE} onChange={(e) => updateField("howitworks_title", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Subtítulo</Label>
            <Input value={settings.howitworks_subtitle ?? DEFAULT_SUBTITLE} onChange={(e) => updateField("howitworks_subtitle", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Frase de Compliance / Segurança</Label>
            <Textarea value={settings.howitworks_compliance ?? DEFAULT_COMPLIANCE} onChange={(e) => updateField("howitworks_compliance", e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-5 w-5 text-primary" />
            Etapas (4 passos)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map((n, i) => (
            <div key={n} className="space-y-3 border-b border-border pb-4 last:border-0">
              <Label className="font-semibold">Etapa {n}</Label>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Título</Label>
                <Input value={settings[`step_${n}_title`] ?? DEFAULT_STEPS[i]?.title ?? ""} onChange={(e) => updateField(`step_${n}_title`, e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Descrição</Label>
                <Textarea value={settings[`step_${n}_desc`] ?? DEFAULT_STEPS[i]?.desc ?? ""} onChange={(e) => updateField(`step_${n}_desc`, e.target.value)} rows={2} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={() => saveKeys(allKeys, "Como Funciona salvo!", "como_funciona")} disabled={saving} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar Como Funciona"}
      </Button>
    </div>
  );
};
