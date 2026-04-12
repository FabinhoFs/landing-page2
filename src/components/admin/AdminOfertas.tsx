import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, ShoppingBag, Plus, Trash2, Loader2, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const DEFAULT_SECTION_TITLE = "Escolha seu Certificado Digital e inicie sua emissão agora";
const DEFAULT_CPF_IDEAL = "Pessoa física, profissionais liberais e quem precisa acessar sistemas oficiais, assinar documentos e operar com mais praticidade no ambiente digital.";
const DEFAULT_CNPJ_IDEAL = "Empresas que precisam emitir notas, cumprir obrigações fiscais e acessar sistemas com segurança e agilidade.";
const DEFAULT_CTA_CPF = "Quero iniciar meu e-CPF A1";
const DEFAULT_CTA_CNPJ = "Quero iniciar meu e-CNPJ A1";
const DEFAULT_MICRO = "Atendimento guiado • Validação online • Suporte durante o processo";
const DEFAULT_SUPPORT = "Atendimento humano e orientação em todas as etapas do processo.";

const DEFAULT_CPF_USOS = ["Assinatura digital de documentos", "Acesso ao e-CAC da Receita Federal", "Declaração de Imposto de Renda", "Rotinas digitais com mais segurança"];
const DEFAULT_CNPJ_USOS = ["Emissão de notas fiscais", "eSocial e obrigações fiscais", "Assinatura digital de documentos", "Acesso a sistemas públicos e privados"];
const DEFAULT_INCLUSO = ["Atendimento guiado no WhatsApp", "Orientação sobre documentos e etapas", "Validação online por videoconferência", "Suporte durante o processo", "Orientação para instalação e uso"];

function ListEditor({ prefix, defaults, settings, updateField }: {
  prefix: string; defaults: string[];
  settings: Record<string, string>; updateField: (k: string, v: string) => void;
}) {
  const getItems = (): string[] => {
    const items: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const val = settings[`${prefix}_${i}`];
      if (val !== undefined && val !== "") items.push(val);
    }
    return items.length > 0 ? items : defaults;
  };
  const items = getItems();

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">{i + 1}.</span>
          <Input value={settings[`${prefix}_${i + 1}`] ?? item} onChange={(e) => updateField(`${prefix}_${i + 1}`, e.target.value)} />
          <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => {
            for (let j = i + 1; j < items.length; j++) updateField(`${prefix}_${j}`, items[j] || "");
            updateField(`${prefix}_${items.length}`, "");
          }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => updateField(`${prefix}_${items.length + 1}`, "Novo item")}>
        <Plus className="mr-1 h-4 w-4" />Adicionar
      </Button>
    </div>
  );
}

export const AdminOfertas = () => {
  const { settings, fetching, saving, updateField, saveKeys } = useAdminSettings();

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const allKeys = [
    "pricing_section_title", "pricing_cpf_ideal", "pricing_cnpj_ideal",
    "pricing_cta_cpf", "pricing_cta_cnpj", "pricing_micro", "support_text",
    "bestseller_active", "bestseller_product",
    ...Array.from({ length: 10 }, (_, i) => `cpf_uso_${i + 1}`),
    ...Array.from({ length: 10 }, (_, i) => `cnpj_uso_${i + 1}`),
    ...Array.from({ length: 10 }, (_, i) => `incluso_${i + 1}`),
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Ofertas — Textos Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Título da Seção</Label>
            <Input value={settings.pricing_section_title ?? DEFAULT_SECTION_TITLE} onChange={(e) => updateField("pricing_section_title", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>e-CPF — Texto "Ideal para"</Label>
            <Textarea value={settings.pricing_cpf_ideal ?? DEFAULT_CPF_IDEAL} onChange={(e) => updateField("pricing_cpf_ideal", e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>e-CNPJ — Texto "Ideal para"</Label>
            <Textarea value={settings.pricing_cnpj_ideal ?? DEFAULT_CNPJ_IDEAL} onChange={(e) => updateField("pricing_cnpj_ideal", e.target.value)} rows={2} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Texto CTA — Card e-CPF</Label>
              <Input value={settings.pricing_cta_cpf ?? DEFAULT_CTA_CPF} onChange={(e) => updateField("pricing_cta_cpf", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Texto CTA — Card e-CNPJ</Label>
              <Input value={settings.pricing_cta_cnpj ?? DEFAULT_CTA_CNPJ} onChange={(e) => updateField("pricing_cta_cnpj", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Microtexto abaixo dos botões</Label>
            <Input value={settings.pricing_micro ?? DEFAULT_MICRO} onChange={(e) => updateField("pricing_micro", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Frase de Suporte (abaixo dos cards)</Label>
            <Input value={settings.support_text ?? DEFAULT_SUPPORT} onChange={(e) => updateField("support_text", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">e-CPF — Principais Usos</CardTitle></CardHeader>
        <CardContent>
          <ListEditor prefix="cpf_uso" defaults={DEFAULT_CPF_USOS} settings={settings} updateField={updateField} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">e-CNPJ — Principais Usos</CardTitle></CardHeader>
        <CardContent>
          <ListEditor prefix="cnpj_uso" defaults={DEFAULT_CNPJ_USOS} settings={settings} updateField={updateField} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Bloco "Incluso" (ambos os cards)</CardTitle></CardHeader>
        <CardContent>
          <ListEditor prefix="incluso" defaults={DEFAULT_INCLUSO} settings={settings} updateField={updateField} />
        </CardContent>
      </Card>

      {/* Badge "Mais Vendido" */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-primary" />
            Badge "Mais Vendido"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">Exibe um selo "⭐ Mais Vendido" sobre o card escolhido na seção de preços.</p>
          <div className="flex items-center gap-3">
            <Switch checked={settings.bestseller_active === "true"} onCheckedChange={(v) => updateField("bestseller_active", v ? "true" : "false")} />
            <span className="text-sm text-muted-foreground">Badge ativo</span>
          </div>
          <div className="space-y-1.5">
            <Label>Exibir no produto</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={settings.bestseller_product || "cnpj"} onChange={(e) => updateField("bestseller_product", e.target.value)}>
              <option value="cpf">e-CPF A1</option>
              <option value="cnpj">e-CNPJ A1</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => saveKeys(allKeys, "Ofertas salvas!")} disabled={saving} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar Ofertas"}
      </Button>
    </div>
  );
};
