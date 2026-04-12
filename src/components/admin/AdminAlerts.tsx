import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AlertItem {
  key: string;
  label: string;
  level: "error" | "warn" | "info";
}

const SETTING_CHECKS: { key: string; label: string; level: "error" | "warn" }[] = [
  { key: "whatsapp_number", label: "Telefone global do WhatsApp não configurado", level: "error" },
  { key: "logo_url", label: "Logo do site não configurada", level: "warn" },
  { key: "favicon_url", label: "Favicon do site não configurado", level: "warn" },
  { key: "seo_title", label: "Título SEO (title tag) não configurado", level: "warn" },
  { key: "seo_description", label: "Meta description não configurada", level: "warn" },
  { key: "seo_og_image", label: "Imagem de compartilhamento (OG Image) não configurada", level: "warn" },
  { key: "seo_og_title", label: "Título de compartilhamento (og:title) não configurado", level: "warn" },
  { key: "g_tag_id", label: "Google Tag (gtag) não configurado", level: "warn" },
  { key: "meta_pixel_id", label: "Meta Pixel não configurado", level: "warn" },
  { key: "g_tag_manager_id", label: "Google Tag Manager não configurado", level: "warn" },
];

const CTA_KEYS = ["cta_hero", "cta_header", "cta_bottom", "cta_ecpf", "cta_ecnpj", "cta_floating"];

export const AdminAlerts = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings" as any).select("key, value");
      const map: Record<string, string> = {};
      if (data) (data as any[]).forEach((r: any) => { map[r.key] = r.value; });

      const found: AlertItem[] = [];

      // Check missing settings
      SETTING_CHECKS.forEach((c) => {
        if (!map[c.key] || map[c.key].trim() === "") {
          found.push({ key: c.key, label: c.label, level: c.level });
        }
      });

      // Check CTA messages
      const missingCtas = CTA_KEYS.filter((k) => !map[k] || map[k].trim() === "");
      if (missingCtas.length > 0) {
        found.push({
          key: "cta_messages",
          label: `${missingCtas.length} CTA(s) sem mensagem personalizada configurada`,
          level: "warn",
        });
      }

      // Check recent tracking events
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const { count } = await supabase
        .from("access_logs")
        .select("id", { count: "exact", head: true })
        .gte("created_at", threeDaysAgo.toISOString());
      if (count === 0) {
        found.push({ key: "no_events", label: "Nenhum evento de tracking nos últimos 3 dias", level: "info" });
      }

      setAlerts(found);
      setLoading(false);
    })();
  }, []);

  if (loading || alerts.length === 0) return null;

  const errors = alerts.filter((a) => a.level === "error");
  const warns = alerts.filter((a) => a.level === "warn");
  const infos = alerts.filter((a) => a.level === "info");

  return (
    <Card className="border-yellow-500/30 bg-yellow-500/5 mb-6">
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <span className="font-semibold text-foreground text-sm">
            {alerts.length} alerta{alerts.length > 1 ? "s" : ""} de configuração
          </span>
        </div>
        <div className="space-y-1.5">
          {errors.map((a) => (
            <div key={a.key} className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              <span className="text-red-400">{a.label}</span>
            </div>
          ))}
          {warns.map((a) => (
            <div key={a.key} className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-yellow-500 shrink-0" />
              <span className="text-yellow-400">{a.label}</span>
            </div>
          ))}
          {infos.map((a) => (
            <div key={a.key} className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
              <span className="text-blue-400">{a.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
