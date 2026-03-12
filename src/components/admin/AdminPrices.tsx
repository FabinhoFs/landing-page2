import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const priceSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive("Preço deve ser positivo").max(99999),
  promotional_price: z.number().positive("Preço promocional deve ser positivo").max(99999).nullable(),
  is_promotion_active: z.boolean(),
  promo_expires_at: z.string().nullable(),
  feature_1: z.string(),
  feature_2: z.string(),
  feature_3: z.string(),
  feature_4: z.string(),
});

interface CertPrice {
  id: string;
  name: string;
  price: number;
  promotional_price: number | null;
  is_promotion_active: boolean;
  promo_expires_at: string | null;
  feature_1: string;
  feature_2: string;
  feature_3: string;
  feature_4: string;
}

export const AdminPrices = () => {
  const [prices, setPrices] = useState<CertPrice[]>([]);
  const [edits, setEdits] = useState<Record<string, Partial<CertPrice>>>({});
  const { toast } = useToast();

  const fetchPrices = async () => {
    const { data } = await supabase.from("certificate_prices").select("*").order("name");
    if (data) setPrices(data as unknown as CertPrice[]);
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
      name: merged.name,
      price: Number(merged.price),
      promotional_price: merged.promotional_price ? Number(merged.promotional_price) : null,
      is_promotion_active: merged.is_promotion_active,
      promo_expires_at: merged.promo_expires_at || null,
      feature_1: merged.feature_1,
      feature_2: merged.feature_2,
      feature_3: merged.feature_3,
      feature_4: merged.feature_4,
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
      <h2 className="text-lg font-semibold text-foreground">Gerenciar Produtos e Preços</h2>

      <div className="space-y-6">
        {prices.map((item) => {
          const current = { ...item, ...edits[item.id] };
          const expiresDate = current.promo_expires_at ? new Date(current.promo_expires_at) : undefined;

          return (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-base">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nome */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Nome do Produto</label>
                  <Input
                    value={current.name}
                    onChange={(e) => updateField(item.id, "name", e.target.value)}
                  />
                </div>

                {/* Preços */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Preço Normal (R$)</label>
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
                </div>

                {/* Promoção */}
                <div className="grid gap-4 sm:grid-cols-2 items-end">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={current.is_promotion_active}
                      onCheckedChange={(v) => updateField(item.id, "is_promotion_active", v)}
                    />
                    <span className="text-sm text-muted-foreground">Promoção Ativa</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Expiração da Promoção</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !expiresDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expiresDate ? format(expiresDate, "dd/MM/yyyy", { locale: ptBR }) : "Sem data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={expiresDate}
                          onSelect={(date) =>
                            updateField(item.id, "promo_expires_at", date ? date.toISOString() : null)
                          }
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Frases */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Frases do Card</label>
                  {[1, 2, 3, 4].map((n) => (
                    <Textarea
                      key={n}
                      placeholder={`Frase ${n}`}
                      value={(current as any)[`feature_${n}`] || ""}
                      onChange={(e) => updateField(item.id, `feature_${n}`, e.target.value)}
                      rows={1}
                      className="resize-none"
                    />
                  ))}
                </div>

                <Button
                  size="sm"
                  onClick={() => handleSave(item)}
                  disabled={!edits[item.id]}
                  className="w-full sm:w-auto"
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
