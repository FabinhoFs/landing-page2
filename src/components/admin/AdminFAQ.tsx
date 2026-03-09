import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { z } from "zod";

const faqSchema = z.object({
  question: z.string().trim().min(5, "Pergunta muito curta").max(500, "Máximo 500 caracteres"),
  answer: z.string().trim().min(10, "Resposta muito curta").max(2000, "Máximo 2000 caracteres"),
  sort_order: z.number().int().min(0),
});

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

export const AdminFAQ = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", sort_order: 0 });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const fetchFaqs = async () => {
    const { data } = await supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setFaqs(data);
  };

  useEffect(() => { fetchFaqs(); }, []);

  const sanitize = (str: string) => str.replace(/<[^>]*>/g, "").trim();

  const handleSave = async () => {
    const clean = {
      question: sanitize(form.question),
      answer: sanitize(form.answer),
      sort_order: form.sort_order,
    };

    const parsed = faqSchema.safeParse(clean);
    if (!parsed.success) {
      toast({ title: "Erro", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from("faqs")
        .update({ ...parsed.data, updated_at: new Date().toISOString() })
        .eq("id", editing);
      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      const { error } = await supabase.from("faqs").insert(parsed.data);
      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
        return;
      }
    }

    setEditing(null);
    setIsAdding(false);
    setForm({ question: "", answer: "", sort_order: 0 });
    fetchFaqs();
    toast({ title: editing ? "FAQ atualizada!" : "FAQ criada!" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    fetchFaqs();
    toast({ title: "FAQ excluída!" });
  };

  const startEdit = (faq: FAQ) => {
    setEditing(faq.id);
    setIsAdding(false);
    setForm({ question: faq.question, answer: faq.answer, sort_order: faq.sort_order });
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditing(null);
    setForm({ question: "", answer: "", sort_order: faqs.length + 1 });
  };

  const cancel = () => {
    setEditing(null);
    setIsAdding(false);
    setForm({ question: "", answer: "", sort_order: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Gerenciar FAQ</h2>
        <Button onClick={startAdd} size="sm" disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" /> Nova Pergunta
        </Button>
      </div>

      {(isAdding || editing) && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">{editing ? "Editar FAQ" : "Nova FAQ"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Pergunta</label>
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                maxLength={500}
                placeholder="Digite a pergunta..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Resposta</label>
              <Textarea
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                maxLength={2000}
                rows={4}
                placeholder="Digite a resposta..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ordem</label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="mr-2 h-4 w-4" /> Salvar
              </Button>
              <Button onClick={cancel} variant="outline" size="sm">
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {faqs.map((faq) => (
          <Card key={faq.id}>
            <CardContent className="flex items-start justify-between gap-4 py-4">
              <div className="flex-1">
                <p className="font-medium text-foreground">{faq.question}</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                <span className="mt-1 text-xs text-muted-foreground">Ordem: {faq.sort_order}</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => startEdit(faq)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(faq.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {faqs.length === 0 && (
          <p className="text-center text-muted-foreground">Nenhuma FAQ cadastrada.</p>
        )}
      </div>
    </div>
  );
};
