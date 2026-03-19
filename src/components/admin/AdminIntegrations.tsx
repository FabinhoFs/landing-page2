import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Globe, ShoppingCart, Facebook } from "lucide-react";

const KEYS = [
  "g_tag_id",
  "g_ads_purchase_label",
  "meta_pixel_id",
  "g_tag_manager_id",
] as const;

type ConfigKeys = (typeof KEYS)[number];

export const AdminIntegrations = () => {
  const [values, setValues] = useState<Record<ConfigKeys, string>>({
    g_tag_id: "",
    g_ads_purchase_label: "",
    meta_pixel_id: "",
    g_tag_manager_id: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", [...KEYS]);
      if (data) {
        const map: any = { ...values };
        data.forEach((r) => {
          if (KEYS.includes(r.key as ConfigKeys)) map[r.key] = r.value;
        });
        setValues(map);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const key of KEYS) {
        const { data: existing } = await supabase
          .from("site_settings")
          .select("id")
          .eq("key", key)
          .maybeSingle();

        if (existing) {
          await supabase.from("site_settings").update({ value: values[key], updated_at: new Date().toISOString() }).eq("key", key);
        } else {
          await supabase.from("site_settings").insert({ key, value: values[key] });
        }
      }
      toast.success("Integrações salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar integrações.");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: ConfigKeys, val: string) => setValues((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Configurações Globais (Header)
          </CardTitle>
          <CardDescription>IDs de rastreamento injetados no cabeçalho de todas as páginas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>ID da Google Tag (gtag.js)</Label>
            <Input placeholder="AW-123456789 ou G-XXXXXXXXXX" value={values.g_tag_id} onChange={(e) => set("g_tag_id", e.target.value)} />
            <p className="text-xs text-muted-foreground">Encontrado em Google Ads → Ferramentas → Conversões ou Google Analytics.</p>
          </div>
          <div className="space-y-2">
            <Label>ID do Google Tag Manager</Label>
            <Input placeholder="GTM-XXXXXXX" value={values.g_tag_manager_id} onChange={(e) => set("g_tag_manager_id", e.target.value)} />
            <p className="text-xs text-muted-foreground">Opcional. Se preenchido, o container GTM será carregado no site.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Google Ads (Conversões)
          </CardTitle>
          <CardDescription>Configure o rótulo de conversão para rastrear compras no Google Ads.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Rótulo de Conversão (Label) de Compra</Label>
          <Input placeholder="AbCdEfGhIjKlMn" value={values.g_ads_purchase_label} onChange={(e) => set("g_ads_purchase_label", e.target.value)} />
          <p className="text-xs text-muted-foreground">Encontrado em Google Ads → Conversões → Detalhes da ação de conversão.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-primary" />
            Meta Pixel
          </CardTitle>
          <CardDescription>Configure o Pixel do Facebook/Meta para rastreamento de eventos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>ID do Pixel do Facebook</Label>
          <Input placeholder="123456789012345" value={values.meta_pixel_id} onChange={(e) => set("meta_pixel_id", e.target.value)} />
          <p className="text-xs text-muted-foreground">Encontrado em Meta Business Suite → Gerenciador de Eventos → Fontes de dados.</p>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
        <Save className="mr-2 h-4 w-4" />
        {saving ? "Salvando..." : "Salvar Integrações"}
      </Button>
    </div>
  );
};
