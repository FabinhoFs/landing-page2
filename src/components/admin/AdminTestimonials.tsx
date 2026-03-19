import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Save, X, Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  sort_order: number;
  is_active: boolean;
  is_google_review: boolean;
}

export const AdminTestimonials = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", role: "", text: "", rating: 5, sort_order: 0, is_google_review: false });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setItems(data as Testimonial[]);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.name.trim() || !form.text.trim()) {
      toast({ title: "Erro", description: "Nome e comentário são obrigatórios.", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      text: form.text.trim(),
      rating: form.rating,
      sort_order: form.sort_order,
      is_google_review: form.is_google_review,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { error } = await supabase.from("testimonials").update(payload).eq("id", editing);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("testimonials").insert([payload]);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    }

    setEditing(null);
    setIsAdding(false);
    setForm({ name: "", role: "", text: "", rating: 5, sort_order: 0, is_google_review: false });
    fetchData();
    toast({ title: editing ? "Depoimento atualizado!" : "Depoimento criado!" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    fetchData();
    toast({ title: "Depoimento excluído!" });
  };

  const startEdit = (t: Testimonial) => {
    setEditing(t.id);
    setIsAdding(false);
    setForm({ name: t.name, role: t.role, text: t.text, rating: t.rating, sort_order: t.sort_order, is_google_review: t.is_google_review });
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditing(null);
    setForm({ name: "", role: "", text: "", rating: 5, sort_order: items.length + 1, is_google_review: false });
  };

  const cancel = () => {
    setEditing(null);
    setIsAdding(false);
    setForm({ name: "", role: "", text: "", rating: 5, sort_order: 0, is_google_review: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Gerenciar Depoimentos</h2>
        <Button onClick={startAdd} size="sm" disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" /> Novo Depoimento
        </Button>
      </div>

      {(isAdding || editing) && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">{editing ? "Editar Depoimento" : "Novo Depoimento"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome do Cliente</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Maria Silva" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Profissão / Cargo</label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Contadora" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Comentário</label>
              <Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3} placeholder="O que o cliente disse..." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nota (estrelas)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} className="focus:outline-none">
                      <Star className={`h-6 w-6 ${n <= form.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Ordem</label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} min={0} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="google-review"
                checked={form.is_google_review}
                onCheckedChange={(checked) => setForm({ ...form, is_google_review: checked === true })}
              />
              <label htmlFor="google-review" className="text-sm font-medium text-foreground cursor-pointer">
                Exibir selo do Google (Avaliação Verificada)
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm"><Save className="mr-2 h-4 w-4" /> Salvar</Button>
              <Button onClick={cancel} variant="outline" size="sm"><X className="mr-2 h-4 w-4" /> Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {items.map((t) => (
          <Card key={t.id}>
            <CardContent className="flex items-start justify-between gap-4 py-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{t.name}</p>
                  <span className="text-xs text-muted-foreground">— {t.role}</span>
                  {t.is_google_review && (
                    <span className="text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Google</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">"{t.text}"</p>
                <div className="mt-1 flex items-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`h-3 w-3 ${j < t.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  ))}
                  <span className="ml-2 text-xs text-muted-foreground">Ordem: {t.sort_order}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => startEdit(t)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground">Nenhum depoimento cadastrado.</p>}
      </div>
    </div>
  );
};
