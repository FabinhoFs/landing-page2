import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle2, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface SystemError {
  id: string;
  source: string;
  message: string;
  payload: any;
  resolved: boolean;
  created_at: string;
  resolved_at: string | null;
}

export const AdminErrors = () => {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "resolved">("pending");

  const fetchErrors = async () => {
    setLoading(true);
    const query = (supabase.from("system_errors") as any)
      .select("*")
      .eq("resolved", filter === "resolved")
      .order("created_at", { ascending: false })
      .limit(100);

    const { data, error } = await query;
    if (error) {
      toast.error("Erro ao carregar diagnósticos");
    } else {
      setErrors(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchErrors();
  }, [filter]);

  const handleResolve = async (id: string) => {
    const { error } = await (supabase.from("system_errors") as any)
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao resolver");
    } else {
      toast.success("Erro marcado como resolvido");
      fetchErrors();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await (supabase.from("system_errors") as any)
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao excluir");
    } else {
      toast.success("Registro excluído");
      fetchErrors();
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          🛠️ Central de Diagnóstico
        </h2>
        <Button variant="outline" size="sm" onClick={fetchErrors}>
          <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
        </Button>
      </div>

      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as "pending" | "resolved")}
      >
        <TabsList>
          <TabsTrigger value="pending">
            <AlertTriangle className="mr-1 h-4 w-4" /> Pendentes
          </TabsTrigger>
          <TabsTrigger value="resolved">
            <CheckCircle2 className="mr-1 h-4 w-4" /> Resolvidos
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : errors.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum erro {filter === "pending" ? "pendente" : "resolvido"}.
        </p>
      ) : (
        <div className="space-y-3">
          {errors.map((err) => (
            <div
              key={err.id}
              className="rounded-lg border border-border bg-card p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {err.source}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(err.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{err.message}</p>
                  {err.payload && (
                    <pre className="text-xs text-muted-foreground bg-muted rounded p-2 overflow-x-auto max-h-32">
                      {typeof err.payload === "string"
                        ? err.payload
                        : JSON.stringify(err.payload, null, 2)}
                    </pre>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  {!err.resolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolve(err.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(err.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
