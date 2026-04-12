import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, History, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AuditRow {
  id: string;
  created_at: string;
  admin_email: string;
  section: string;
  entity_key: string | null;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  action_type: string;
}

const SECTION_LABELS: Record<string, string> = {
  header: "Header",
  hero: "Hero",
  dores: "Dores",
  como_funciona: "Como Funciona",
  ofertas: "Ofertas",
  diferenciais: "Diferenciais",
  testimonials: "Depoimentos",
  seguranca: "Segurança",
  institucional: "Institucional",
  faq: "FAQ",
  cta_final: "CTA Final",
  footer: "Rodapé",
  whatsapp: "WhatsApp",
  settings: "Configurações",
  integrations: "Integrações",
  version_restore: "Restauração de Versão",
};

const ACTION_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  update: { label: "Alteração", variant: "default" },
  create: { label: "Criação", variant: "secondary" },
  delete: { label: "Remoção", variant: "destructive" },
  restore: { label: "Restauração", variant: "outline" },
};

function truncate(val: string | null, max = 60) {
  if (!val) return "—";
  return val.length > max ? val.slice(0, max) + "…" : val;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export const AdminAuditLog = () => {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("admin_audit_log" as any)
      .select("id, created_at, admin_email, section, entity_key, field_name, old_value, new_value, action_type")
      .order("created_at", { ascending: false })
      .limit(limit);
    setRows((data as any as AuditRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [limit]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-5 w-5 text-primary" />
                Histórico de Alterações
              </CardTitle>
              <CardDescription>Registro de todas as mudanças feitas no painel administrativo.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetch}>
              <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma alteração registrada ainda. As mudanças aparecerão aqui conforme o admin editar o site.
            </p>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => {
                const action = ACTION_LABELS[row.action_type] || ACTION_LABELS.update;
                return (
                  <div key={row.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={action.variant} className="text-xs">{action.label}</Badge>
                        <span className="text-sm font-medium text-foreground">
                          {SECTION_LABELS[row.section] || row.section}
                        </span>
                        {row.field_name && (
                          <span className="text-xs text-muted-foreground">→ {row.field_name}</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(row.created_at)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Por: <span className="font-medium text-foreground">{row.admin_email}</span>
                    </div>
                    {(row.old_value || row.new_value) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        <div className="rounded bg-destructive/10 p-2">
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-0.5">Antes</p>
                          <p className="text-xs text-foreground break-all">{truncate(row.old_value)}</p>
                        </div>
                        <div className="rounded bg-green-500/10 p-2">
                          <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-0.5">Depois</p>
                          <p className="text-xs text-foreground break-all">{truncate(row.new_value)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {rows.length >= limit && (
                <Button variant="ghost" className="w-full" onClick={() => setLimit(l => l + 50)}>
                  Carregar mais
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
