import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const priceSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive("Preço deve ser positivo").max(99999),
  promotional_price: z.number().positive("Preço promocional deve ser positivo").max(99999).nullable(),
  is_promotion_active: z.boolean(),
  promo_expires_at: z.string().nullable(),
});

interface CertPrice {
  id: string;
  name: string;
  price: number;
  promotional_price: number | null;
  is_promotion_active: boolean;
  promo_expires_at: string | null;
}

interface CertFeature {
  id: string;
  certificate_id: string;
  text: string;
  icon: string;
  sort_order: number;
}

const FEATURE_MAX_CHARS = 50;

export const AdminPrices = () => {
  const [prices, setPrices] = useState<CertPrice[]>([]);
  const [features, setFeatures] = useState<CertFeature[]>([]);
  const [featureEdits, setFeatureEdits] = useState<Record<string, Partial<CertFeature>>>({});
  const [edits, setEdits] = useState<Record<string, Partial<CertPrice>>>({});
  const { toast } = useToast();

  const fetchData = async () => {
    const [{ data: pricesData }, { data: featuresData }] = await Promise.all([
      supabase.from("certificate_prices").select("id, name, price, promotional_price, is_promotion_active, promo_expires_at").order("name"),
      supabase.from("certificate_features" as any).select("*").order("sort_order"),
    ]);
    if (pricesData) setPrices(pricesData as unknown as CertPrice[]);
    if (featuresData) {
      setFeatures(featuresData as unknown as CertFeature[]);
      setFeatureEdits({});
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateField = (id: string, field: string, value: unknown) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSave = async (item: CertPrice) => {
    const changes = edits[item.id];
    if (!changes) return;
    const merged = { ...item, ...changes };
    const parsed = priceSchema.safeParse({
      name: merged.name,
      price: Number(merged.price),
      promotional_price: merged.promotional_price ? Number(merged.promotional_price) : null,
      is_promotion_active: merged.is_promotion_active,
      promo_expires_at: merged.promo_expires_at || null,
    });
    if (!parsed.success) {
      toast({ title: "Erro", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    const { error } = await supabase
      .from("certificate_prices")
      .update({ ...parsed.data, updated_at: new Date().toISOString() } as any)
      .eq("id", item.id);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    setEdits((prev) => { const next = { ...prev }; delete next[item.id]; return next; });
    fetchData();
    toast({ title: "Preço atualizado!" });
  };

  const addFeature = async (certificateId: string) => {
    const certFeatures = features.filter(f => f.certificate_id === certificateId);
    const maxOrder = certFeatures.length > 0 ? Math.max(...certFeatures.map(f => f.sort_order)) : 0;
    const { error } = await supabase.from("certificate_features" as any).insert({
      certificate_id: certificateId,
      text: "Nova frase",
      icon: "check",
      sort_order: maxOrder + 1,
    } as any);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    fetchData();
    toast({ title: "Frase adicionada!" });
  };

  const updateFeatureLocal = (featureId: string, field: string, value: string) => {
    if (field === "text" && value.length > FEATURE_MAX_CHARS) return;
    setFeatureEdits((prev) => ({ ...prev, [featureId]: { ...prev[featureId], [field]: value } }));
  };

  const saveAllFeatures = async (certificateId: string) => {
    const certFeatureIds = features.filter(f => f.certificate_id === certificateId).map(f => f.id);
    const pendingEdits = certFeatureIds.filter(id => featureEdits[id]);
    if (pendingEdits.length === 0) return;

    for (const fid of pendingEdits) {
      const changes = featureEdits[fid];
      const { error } = await supabase.from("certificate_features" as any).update(changes as any).eq("id", fid);
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }
    }
    setFeatureEdits((prev) => {
      const next = { ...prev };
      pendingEdits.forEach(id => delete next[id]);
      return next;
    });
    fetchData();
    toast({ title: "Frases salvas!" });
  };

  const deleteFeature = async (featureId: string) => {
    const { error } = await supabase.from("certificate_features" as any).delete().eq("id", featureId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    fetchData();
    toast({ title: "Frase removida!" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Gerenciar Produtos e Preços</h2>

      <div className="space-y-6">
        {prices.map((item) => {
          const current = { ...item, ...edits[item.id] };
          const expiresDate = current.promo_expires_at ? new Date(current.promo_expires_at) : undefined;
          const certFeatures = features
            .filter(f => f.certificate_id === item.id)
            .sort((a, b) => a.sort_order - b.sort_order);

          return (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-base">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nome */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Nome do Produto</label>
                  <Input value={current.name} onChange={(e) => updateField(item.id, "name", e.target.value)} />
                </div>

                {/* Preços */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Preço Normal (R$)</label>
                    <Input type="number" step="0.01" value={current.price} onChange={(e) => updateField(item.id, "price", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Preço Promocional (R$)</label>
                    <Input type="number" step="0.01" value={current.promotional_price ?? ""} onChange={(e) => updateField(item.id, "promotional_price", e.target.value ? parseFloat(e.target.value) : null)} />
                  </div>
                </div>

                {/* Promoção */}
                <div className="grid gap-4 sm:grid-cols-2 items-end">
                  <div className="flex items-center gap-2">
                    <Switch checked={current.is_promotion_active} onCheckedChange={(v) => updateField(item.id, "is_promotion_active", v)} />
                    <span className="text-sm text-muted-foreground">Promoção Ativa</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Expiração da Promoção</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !expiresDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expiresDate ? format(expiresDate, "dd/MM/yyyy", { locale: ptBR }) : "Sem data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={expiresDate} onSelect={(date) => updateField(item.id, "promo_expires_at", date ? date.toISOString() : null)} initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Button size="sm" onClick={() => handleSave(item)} disabled={!edits[item.id]} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" /> Salvar Preços
                </Button>

                {/* Frases dinâmicas */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Frases do Card</label>
                    <Button size="sm" variant="outline" onClick={() => addFeature(item.id)}>
                      <Plus className="mr-1 h-4 w-4" /> Adicionar frase
                    </Button>
                  </div>

                  {certFeatures.map((feat, idx) => {
                    const currentFeat = { ...feat, ...featureEdits[feat.id] };
                    const hasChanges = !!featureEdits[feat.id];
                    return (
                      <div key={feat.id} className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 mt-3 text-muted-foreground shrink-0" />
                        <div className="flex-1 space-y-1">
                          <Input
                            value={currentFeat.text}
                            onChange={(e) => updateFeatureLocal(feat.id, "text", e.target.value)}
                            placeholder={`Frase ${idx + 1}`}
                          />
                        </div>
                        <Select value={currentFeat.icon} onValueChange={(v) => updateFeatureLocal(feat.id, "icon", v)}>
                          <SelectTrigger className="w-32 shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="check">✅ Check</SelectItem>
                            <SelectItem value="headphones">🎧 Suporte</SelectItem>
                          </SelectContent>
                        </Select>
                        {hasChanges && (
                          <Button size="icon" variant="outline" className="shrink-0" onClick={() => saveFeature(feat)}>
                            <Save className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="shrink-0 text-destructive hover:text-destructive" onClick={() => deleteFeature(feat.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}

                  {certFeatures.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Nenhuma frase cadastrada. Clique em "Adicionar frase".</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
