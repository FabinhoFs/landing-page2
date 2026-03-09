import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { z } from "zod";

const priceSchema = z.object({
  price: z.number().positive("Preço deve ser positivo").max(99999),
  promotional_price: z.number().positive("Preço promocional deve ser positivo").max(99999).nullable(),
  is_promotion_active: z.boolean(),
});

interface CertPrice {
  id: string;
  name: string;
  price: number;
  promotional_price: number | null;
  is_promotion_active: boolean;
}

export const AdminPrices = () => {
  const [prices, setPrices] = useState<CertPrice[]>([]);
  const [edits, setEdits] = useState<Record<string, Partial<CertPrice>>>({});
  const { toast } = useToast();

  const fetchPrices = async () => {
    const { data } = await supabase.from("certificate_prices").select("*").order("name");
    if (data) setPrices(data);
  };

  useEffect(() => { fetchPrices(); }, []);

  const updateField = (id: string, field: string, value: unknown) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (item: CertPrice) => {
    const changes = edits[item.id];
    if (!changes) return;

    const merged = { ...item, ...changes };
    const parsed = priceSchema.safeParse({
      price: Number(merged.price),
      promotional_price: merged.promotional_price ? Number(merged.promotional_price) : null,
      is_promotion_active: merged.is_promotion_active,
    });

    if (!parsed.success) {
      toast({ title: "Erro", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("certificate_prices")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", item.id);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }

    setEdits((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    fetchPrices();
    toast({ title: "Preço atualizado!" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Gerenciar Preços</h2>

      <div className="space-y-4">
        {prices.map((item) => {
          const current = { ...item, ...edits[item.id] };
          return (
            <Card key={item.id}>
              <CardContent className="grid gap-4 py-4 sm:grid-cols-5 sm:items-end">
                <div>
                  <label className="text-sm font-medium text-foreground">{item.name}</label>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Preço (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={current.price}
                    onChange={(e) => updateField(item.id, "price", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Preço Promocional (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={current.promotional_price ?? ""}
                    onChange={(e) =>
                      updateField(item.id, "promotional_price", e.target.value ? parseFloat(e.target.value) : null)
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={current.is_promotion_active}
                    onCheckedChange={(v) => updateField(item.id, "is_promotion_active", v)}
                  />
                  <span className="text-sm text-muted-foreground">Promoção</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSave(item)}
                  disabled={!edits[item.id]}
                >
                  <Save className="mr-2 h-4 w-4" /> Salvar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
