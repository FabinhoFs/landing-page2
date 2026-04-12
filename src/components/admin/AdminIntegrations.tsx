import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Save, Globe, ShoppingCart, Facebook, ShieldAlert, CheckCircle2,
  AlertCircle, XCircle, HelpCircle, ExternalLink, ClipboardCopy,
  Zap, Info, MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const KEYS = [
  "g_tag_id",
  "g_ads_purchase_label",
  "meta_pixel_id",
  "g_tag_manager_id",
] as const;

const GEO_KEYS = ["geo_provider", "geo_api_key", "geo_fallback"] as const;
type GeoKeys = (typeof GEO_KEYS)[number];

const POPUP_KEYS = [
  "popup_enabled",
  "popup_trigger_desktop",
  "popup_trigger_mobile_scroll",
  "popup_trigger_mobile_back",
  "popup_title",
  "popup_subtitle",
  "popup_discount_value",
] as const;
type PopupKeys = (typeof POPUP_KEYS)[number];

const SPAM_KEYS = ["spam_guard_enabled", "spam_max_requests", "spam_window_ms"] as const;
type SpamKeys = (typeof SPAM_KEYS)[number];

type ConfigKeys = (typeof KEYS)[number];

type IntegrationStatus = "configured" | "partial" | "not_configured";

interface IntegrationInfo {
  key: ConfigKeys;
  label: string;
  description: string;
  purpose: string;
  required: boolean;
  placeholder: string;
  format: string;
  whereToFind: string;
  helpUrl: string;
  validate: (val: string) => { valid: boolean; message?: string };
  relatedKeys?: ConfigKeys[];
}

const INTEGRATIONS: IntegrationInfo[] = [
  {
    key: "g_tag_id",
    label: "Google Tag (gtag.js)",
    description: "Tag global do Google para rastreamento de conversões e analytics.",
    purpose: "Necessário para rastrear conversões no Google Ads e/ou medir tráfego no Google Analytics 4.",
    required: true,
    placeholder: "AW-123456789 ou G-XXXXXXXXXX",
    format: "Começa com AW- (Google Ads) ou G- (Google Analytics 4), seguido de números/letras.",
    whereToFind: "Google Ads → Ferramentas e configurações → Conversões → Tag global. Ou Google Analytics → Admin → Fluxos de dados → ID de medição.",
    helpUrl: "https://support.google.com/google-ads/answer/6095821",
    validate: (val) => {
      if (!val) return { valid: true };
      if (/^(AW-\d{8,12}|G-[A-Z0-9]{8,12})$/.test(val)) return { valid: true };
      return { valid: false, message: "Formato esperado: AW-123456789 ou G-XXXXXXXXXX" };
    },
  },
  {
    key: "g_tag_manager_id",
    label: "Google Tag Manager (GTM)",
    description: "Container GTM para gerenciar todas as tags em um único lugar.",
    purpose: "Opcional. Use se você gerencia tags pelo GTM em vez de inserir diretamente. Ideal para equipes de marketing.",
    required: false,
    placeholder: "GTM-XXXXXXX",
    format: "Começa com GTM- seguido de 7 caracteres alfanuméricos.",
    whereToFind: "Google Tag Manager → Área de trabalho → O ID aparece no canto superior direito (ex: GTM-ABCD123).",
    helpUrl: "https://support.google.com/tagmanager/answer/6103696",
    validate: (val) => {
      if (!val) return { valid: true };
      if (/^GTM-[A-Z0-9]{5,8}$/.test(val)) return { valid: true };
      return { valid: false, message: "Formato esperado: GTM-XXXXXXX (ex: GTM-AB1C2D3)" };
    },
  },
  {
    key: "g_ads_purchase_label",
    label: "Rótulo de Conversão — Google Ads",
    description: "Label de conversão de compra para atribuir vendas às campanhas Google Ads.",
    purpose: "Obrigatório se você usa Google Ads. Sem ele, cliques em CTAs não serão reportados como conversões nas campanhas.",
    required: true,
    placeholder: "AbCdEfGhIjKlMn",
    format: "String alfanumérica gerada automaticamente pelo Google Ads (10-20 caracteres).",
    whereToFind: "Google Ads → Metas → Conversões → clique na ação desejada → Configuração de tag → Use o Google Tag → copie apenas o Label.",
    helpUrl: "https://support.google.com/google-ads/answer/6331304",
    validate: (val) => {
      if (!val) return { valid: true };
      if (/^[A-Za-z0-9_-]{6,30}$/.test(val)) return { valid: true };
      return { valid: false, message: "Apenas letras, números, _ e - (6-30 caracteres)" };
    },
  },
  {
    key: "meta_pixel_id",
    label: "Meta Pixel (Facebook)",
    description: "Pixel de rastreamento para campanhas Meta (Facebook e Instagram Ads).",
    purpose: "Necessário para rastrear conversões em campanhas Meta Ads. Dispara eventos PageView e Purchase automaticamente.",
    required: true,
    placeholder: "123456789012345",
    format: "15-16 dígitos numéricos.",
    whereToFind: "Meta Business Suite → Gerenciador de Eventos → Fontes de dados → selecione seu Pixel → o ID aparece no topo.",
    helpUrl: "https://www.facebook.com/business/help/952192354843755",
    validate: (val) => {
      if (!val) return { valid: true };
      if (/^\d{15,16}$/.test(val)) return { valid: true };
      return { valid: false, message: "O Pixel ID deve ter 15-16 dígitos numéricos" };
    },
  },
];

function getStatus(key: ConfigKeys, values: Record<ConfigKeys, string>): IntegrationStatus {
  const val = values[key]?.trim();
  if (!val) return "not_configured";
  const info = INTEGRATIONS.find((i) => i.key === key)!;
  const validation = info.validate(val);
  if (!validation.valid) return "partial";
  return "configured";
}

function StatusBadge({ status }: { status: IntegrationStatus }) {
  if (status === "configured") {
    return (
      <Badge variant="outline" className="border-green-500/40 bg-green-500/10 text-green-600 gap-1">
        <CheckCircle2 className="h-3 w-3" /> Configurado
      </Badge>
    );
  }
  if (status === "partial") {
    return (
      <Badge variant="outline" className="border-yellow-500/40 bg-yellow-500/10 text-yellow-600 gap-1">
        <AlertCircle className="h-3 w-3" /> Formato inválido
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-muted-foreground/30 bg-muted/50 text-muted-foreground gap-1">
      <XCircle className="h-3 w-3" /> Não configurado
    </Badge>
  );
}

export const AdminIntegrations = () => {
  const [values, setValues] = useState<Record<ConfigKeys, string>>({
    g_tag_id: "",
    g_ads_purchase_label: "",
    meta_pixel_id: "",
    g_tag_manager_id: "",
  });
  const [geoValues, setGeoValues] = useState<Record<GeoKeys, string>>({
    geo_provider: "ipapi",
    geo_api_key: "",
    geo_fallback: "true",
  });
  const [popupValues, setPopupValues] = useState<Record<PopupKeys, string>>({
    popup_enabled: "true",
    popup_trigger_desktop: "true",
    popup_trigger_mobile_scroll: "true",
    popup_trigger_mobile_back: "false",
    popup_title: "ESPERA! NÃO VÁ EMBORA.",
    popup_subtitle: "Garanta um desconto exclusivo para emitir seu Certificado Digital agora.",
    popup_discount_value: "20",
  });
  const [spamValues, setSpamValues] = useState<Record<SpamKeys, string>>({
    spam_guard_enabled: "true",
    spam_max_requests: "20",
    spam_window_ms: "60000",
  });
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setAuthorized(false); return; }
      setAuthorized(true);

      const allKeys = [...KEYS, ...GEO_KEYS, ...POPUP_KEYS, ...SPAM_KEYS];
      const { data } = await (supabase
        .from("site_settings") as any)
        .select("key, value")
        .eq("environment", "draft")
        .in("key", allKeys);

      const loaded: Partial<Record<string, string>> = {};
      data?.forEach((r: any) => { loaded[r.key] = r.value; });

      setValues((prev) => ({
        g_tag_id: loaded.g_tag_id ?? prev.g_tag_id ?? "",
        g_ads_purchase_label: loaded.g_ads_purchase_label ?? prev.g_ads_purchase_label ?? "",
        meta_pixel_id: loaded.meta_pixel_id ?? prev.meta_pixel_id ?? "",
        g_tag_manager_id: loaded.g_tag_manager_id ?? prev.g_tag_manager_id ?? "",
      }));

      setGeoValues((prev) => ({
        geo_provider: (loaded.geo_provider as GeoKeys) ?? prev.geo_provider,
        geo_api_key: loaded.geo_api_key ?? prev.geo_api_key,
        geo_fallback: loaded.geo_fallback ?? prev.geo_fallback,
      }));

      setPopupValues((prev) => ({
        popup_enabled: loaded.popup_enabled ?? prev.popup_enabled,
        popup_trigger_desktop: loaded.popup_trigger_desktop ?? prev.popup_trigger_desktop,
        popup_trigger_mobile_scroll: loaded.popup_trigger_mobile_scroll ?? prev.popup_trigger_mobile_scroll,
        popup_trigger_mobile_back: loaded.popup_trigger_mobile_back ?? prev.popup_trigger_mobile_back,
        popup_title: loaded.popup_title ?? prev.popup_title,
        popup_subtitle: loaded.popup_subtitle ?? prev.popup_subtitle,
        popup_discount_value: loaded.popup_discount_value ?? prev.popup_discount_value,
      }));

      setSpamValues((prev) => ({
        spam_guard_enabled: loaded.spam_guard_enabled ?? prev.spam_guard_enabled,
        spam_max_requests: loaded.spam_max_requests ?? prev.spam_max_requests,
        spam_window_ms: loaded.spam_window_ms ?? prev.spam_window_ms,
      }));
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const trackingRows = KEYS.map((key) => ({
        key,
        value: values[key],
        environment: "draft",
        updated_at: new Date().toISOString(),
      }));
      const geoRows = GEO_KEYS.map((key) => ({
        key,
        value: geoValues[key],
        environment: "draft",
        updated_at: new Date().toISOString(),
      }));
      const popupRows = POPUP_KEYS.map((key) => ({
        key,
        value: popupValues[key],
        environment: "draft",
        updated_at: new Date().toISOString(),
      }));
      const spamRows = SPAM_KEYS.map((key) => ({
        key,
        value: spamValues[key],
        environment: "draft",
        updated_at: new Date().toISOString(),
      }));
      const { error } = await (supabase
        .from("site_settings") as any)
        .upsert([...trackingRows, ...geoRows, ...popupRows, ...spamRows], { onConflict: "key,environment" });
      if (error) throw error;
      toast.success("Integrações salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar integrações.");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: ConfigKeys, val: string) => setValues((prev) => ({ ...prev, [key]: val }));

  if (authorized === null) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">Verificando permissões...</div>;
  }

  if (!authorized) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <ShieldAlert className="h-10 w-10 text-destructive" />
          <p className="text-lg font-semibold text-destructive">Acesso Negado</p>
          <p className="text-sm text-muted-foreground">Você precisa estar autenticado como administrador para acessar esta seção.</p>
        </CardContent>
      </Card>
    );
  }

  // Checklist
  const checklistItems = [
    { label: "Google Tag (gtag)", ok: getStatus("g_tag_id", values) === "configured", critical: true },
    { label: "Rótulo de conversão (Google Ads)", ok: getStatus("g_ads_purchase_label", values) === "configured", critical: true },
    { label: "Meta Pixel (Facebook/Instagram)", ok: getStatus("meta_pixel_id", values) === "configured", critical: true },
    { label: "Google Tag Manager (GTM)", ok: getStatus("g_tag_manager_id", values) === "configured", critical: false },
  ];

  const configuredCount = checklistItems.filter((c) => c.ok).length;
  const criticalMissing = checklistItems.filter((c) => c.critical && !c.ok);

  // Recommendations
  const recommendations: string[] = [];
  if (!values.g_tag_id?.trim() && values.g_ads_purchase_label?.trim()) {
    recommendations.push("Você tem um rótulo de conversão do Google Ads, mas sem a Google Tag. O rótulo não vai funcionar sem a tag global configurada.");
  }
  if (values.g_tag_id?.trim() && !values.g_ads_purchase_label?.trim()) {
    recommendations.push("Google Tag configurada, mas sem rótulo de conversão. Cliques nos CTAs não serão reportados como conversões no Google Ads.");
  }
  if (!values.meta_pixel_id?.trim()) {
    recommendations.push("Meta Pixel não configurado. Campanhas no Facebook/Instagram não terão rastreamento de conversões.");
  }
  if (!values.g_tag_id?.trim() && !values.meta_pixel_id?.trim()) {
    recommendations.push("Nenhuma integração de tráfego pago está configurada. Configure pelo menos uma para rastrear resultados das campanhas.");
  }

  const ICON_MAP: Record<ConfigKeys, React.ReactNode> = {
    g_tag_id: <Globe className="h-5 w-5 text-primary" />,
    g_tag_manager_id: <Zap className="h-5 w-5 text-primary" />,
    g_ads_purchase_label: <ShoppingCart className="h-5 w-5 text-primary" />,
    meta_pixel_id: <Facebook className="h-5 w-5 text-primary" />,
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Checklist Card */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Checklist de Tráfego Pago
            </CardTitle>
            <CardDescription>
              {configuredCount}/{checklistItems.length} integrações configuradas
              {criticalMissing.length > 0 && (
                <span className="text-destructive font-medium"> — {criticalMissing.length} crítica(s) pendente(s)</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {checklistItems.map((item) => (
                <div key={item.label} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  item.ok
                    ? "bg-green-500/5 text-green-700 dark:text-green-400"
                    : item.critical
                    ? "bg-destructive/5 text-destructive"
                    : "bg-muted/50 text-muted-foreground"
                }`}>
                  {item.ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{item.label}</span>
                  {!item.critical && !item.ok && (
                    <span className="text-xs opacity-70">(opcional)</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                <AlertCircle className="h-4 w-4" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-300">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Integration Cards */}
        {INTEGRATIONS.map((info) => {
          const status = getStatus(info.key, values);
          const validation = info.validate(values[info.key]);

          return (
            <Card key={info.key} className={`transition-colors ${
              status === "configured" ? "border-green-500/20" :
              status === "partial" ? "border-yellow-500/30" : ""
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{ICON_MAP[info.key]}</div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                        {info.label}
                        <StatusBadge status={status} />
                        {info.required && (
                          <Badge variant="outline" className="text-[10px] font-normal">Recomendado</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">{info.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Purpose */}
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground/80">Para que serve:</strong> {info.purpose}
                  </p>
                </div>

                {/* Input */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-semibold">{info.label}</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-xs"><strong>Formato:</strong> {info.format}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    placeholder={info.placeholder}
                    value={values[info.key]}
                    onChange={(e) => set(info.key, e.target.value.trim())}
                    className={!validation.valid ? "border-yellow-500 focus-visible:ring-yellow-500/30" : ""}
                  />
                  {!validation.valid && validation.message && (
                    <p className="text-xs text-yellow-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {validation.message}
                    </p>
                  )}
                </div>

                {/* Where to find */}
                <details className="group">
                  <summary className="flex items-center gap-1.5 text-xs text-primary cursor-pointer hover:underline">
                    <HelpCircle className="h-3.5 w-3.5" />
                    Onde encontrar esse dado?
                  </summary>
                  <div className="mt-2 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground leading-relaxed space-y-2">
                    <p>{info.whereToFind}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-mono bg-muted px-2 py-0.5 rounded">{info.placeholder}</p>
                      <span className="text-[10px] text-muted-foreground/60">← exemplo de formato</span>
                    </div>
                    <a
                      href={info.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                    >
                      <ExternalLink className="h-3 w-3" /> Documentação oficial
                    </a>
                  </div>
                </details>
              </CardContent>
            </Card>
          );
        })}

        {/* Geolocation Settings Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <CardTitle className="text-base">Geolocalização</CardTitle>
                <CardDescription>
                  Provedor de IP para detecção de cidade. Suporta fallback automático contra erro 429.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Provedor</Label>
              <Select
                value={geoValues.geo_provider}
                onValueChange={(v) => setGeoValues((prev) => ({ ...prev, geo_provider: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ipapi">ipapi.co (padrão)</SelectItem>
                  <SelectItem value="ip-api">ip-api.com (gratuito)</SelectItem>
                  <SelectItem value="cloudflare">Cloudflare Headers (requer CF)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                O provedor principal para detectar a cidade do visitante.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Chave PRO (opcional)</Label>
              <Input
                placeholder="Sua chave de API PRO"
                value={geoValues.geo_api_key}
                onChange={(e) => setGeoValues((prev) => ({ ...prev, geo_api_key: e.target.value.trim() }))}
              />
              <p className="text-xs text-muted-foreground">
                Chave PRO do ipapi.co para evitar limites de requisição. Deixe vazio para plano gratuito.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm font-semibold">Fallback multi-provedor</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Se o provedor principal falhar (erro 429), tenta os outros automaticamente.
                </p>
              </div>
              <Switch
                checked={geoValues.geo_fallback === "true"}
                onCheckedChange={(checked) =>
                  setGeoValues((prev) => ({ ...prev, geo_fallback: checked ? "true" : "false" }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Popup de Retenção Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <CardTitle className="text-base">Popup de Retenção (Exit Intent)</CardTitle>
                <CardDescription>
                  Exibe um popup com desconto quando o usuário tenta sair da página. Configuração de gatilhos por dispositivo.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Global toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm font-semibold">Popup ativo</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Liga/desliga o popup de retenção globalmente.</p>
              </div>
              <Switch
                checked={popupValues.popup_enabled === "true"}
                onCheckedChange={(c) => setPopupValues((p) => ({ ...p, popup_enabled: c ? "true" : "false" }))}
              />
            </div>

            {/* Desktop trigger */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm font-semibold">Gatilho Desktop (Mouse)</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Dispara quando o mouse sai pelo topo da janela.</p>
              </div>
              <Switch
                checked={popupValues.popup_trigger_desktop === "true"}
                onCheckedChange={(c) => setPopupValues((p) => ({ ...p, popup_trigger_desktop: c ? "true" : "false" }))}
              />
            </div>

            {/* Mobile scroll trigger */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm font-semibold">Gatilho Mobile (Scroll rápido)</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Detecta subidas rápidas no celular como intenção de saída.</p>
              </div>
              <Switch
                checked={popupValues.popup_trigger_mobile_scroll === "true"}
                onCheckedChange={(c) => setPopupValues((p) => ({ ...p, popup_trigger_mobile_scroll: c ? "true" : "false" }))}
              />
            </div>

            {/* Mobile back button trigger */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm font-semibold">Gatilho Mobile (Botão Voltar)</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Intercepta o botão "voltar" do navegador e exibe o popup. Use com cuidado pois altera o histórico de navegação.
                </p>
              </div>
              <Switch
                checked={popupValues.popup_trigger_mobile_back === "true"}
                onCheckedChange={(c) => setPopupValues((p) => ({ ...p, popup_trigger_mobile_back: c ? "true" : "false" }))}
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground/80">Como funciona:</strong> O gatilho de <strong>Scroll</strong> detecta subidas rápidas no celular (mais de 150px em menos de 200ms).
                O gatilho de <strong>Botão Voltar</strong> intercepta a tentativa de saída do navegador. O popup é exibido apenas <strong>uma vez por sessão</strong>.
              </p>
            </div>

            {/* Popup content fields */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Título do Popup</Label>
              <Input
                value={popupValues.popup_title}
                onChange={(e) => setPopupValues((p) => ({ ...p, popup_title: e.target.value }))}
                placeholder="ESPERA! NÃO VÁ EMBORA."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Subtítulo</Label>
              <Input
                value={popupValues.popup_subtitle}
                onChange={(e) => setPopupValues((p) => ({ ...p, popup_subtitle: e.target.value }))}
                placeholder="Garanta um desconto exclusivo..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Valor do Desconto (R$)</Label>
              <Input
                value={popupValues.popup_discount_value}
                onChange={(e) => setPopupValues((p) => ({ ...p, popup_discount_value: e.target.value }))}
                placeholder="20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Anti-Spam Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <CardTitle className="text-base">Proteção Anti-Spam (Frontend)</CardTitle>
                <CardDescription>
                  Rate limiting via localStorage para proteger o Supabase contra loops e excesso de requisições do navegador.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm font-semibold">Anti-Spam ativo</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Liga/desliga a trava de rate limiting no frontend.</p>
              </div>
              <Switch
                checked={spamValues.spam_guard_enabled === "true"}
                onCheckedChange={(c) => setSpamValues((p) => ({ ...p, spam_guard_enabled: c ? "true" : "false" }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Limite de requisições</Label>
              <Input
                type="number"
                value={spamValues.spam_max_requests}
                onChange={(e) => setSpamValues((p) => ({ ...p, spam_max_requests: e.target.value }))}
                placeholder="20"
              />
              <p className="text-xs text-muted-foreground">
                Número máximo de ações permitidas dentro da janela de tempo.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Janela de tempo (ms)</Label>
              <Input
                type="number"
                value={spamValues.spam_window_ms}
                onChange={(e) => setSpamValues((p) => ({ ...p, spam_window_ms: e.target.value }))}
                placeholder="60000"
              />
              <p className="text-xs text-muted-foreground">
                Janela em milissegundos (60000 = 1 minuto).
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground/80">Como funciona:</strong> Cada ação de escrita (log de acesso, eventos de experimento, eventos UTM) é contabilizada no <code className="bg-muted px-1 rounded">localStorage</code>. Se o limite for atingido, novas escritas são bloqueadas silenciosamente até a janela expirar.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Integrações"}
        </Button>
      </div>
    </TooltipProvider>
  );
};
