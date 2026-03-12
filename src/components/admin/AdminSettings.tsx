import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, Phone } from "lucide-react";

export const AdminSettings = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings" as any)
        .select("value")
        .eq("key", "whatsapp_number")
        .single();
      if (data) setWhatsappNumber((data as any).value);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("site_settings" as any)
      .update({ value: whatsappNumber, updated_at: new Date().toISOString() } as any)
      .eq("key", "whatsapp_number");

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Número atualizado!", description: "O novo número já está ativo em toda a Landing Page." });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-5 w-5 text-primary" />
            Número do WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Número completo com DDI + DDD (somente números)</Label>
            <Input
              id="whatsapp"
              placeholder="5524974022516"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
            />
            <p className="text-xs text-muted-foreground">
              Exemplo: 55 (Brasil) + 24 (DDD) + 974022516 = 5524974022516
            </p>
          </div>
          <Button onClick={handleSave} disabled={loading || !whatsappNumber}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Salvando..." : "Salvar número"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
