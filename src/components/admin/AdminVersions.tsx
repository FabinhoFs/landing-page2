import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logAuditEntry } from "@/lib/auditLog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, RotateCcw, Archive, RefreshCw, Trash2, Eraser } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageVersion {
  id: string;
  created_at: string;
  created_by_email: string;
  version_name: string;
  description: string | null;
  is_restored: boolean;
  restored_at: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export const AdminVersions = () => {
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [keepCount, setKeepCount] = useState("10");
  const [versionName, setVersionName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const fetchVersions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("page_versions" as any)
      .select("id, created_at, created_by_email, version_name, description, is_restored, restored_at")
      .order("created_at", { ascending: false })
      .limit(100);
    setVersions((data as any as PageVersion[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchVersions(); }, []);

  const handleSaveVersion = async () => {
    if (!versionName.trim()) {
      toast({ title: "Nome obrigatório", description: "Dê um nome para esta versão.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: settingsData } = await supabase.from("site_settings" as any).select("key, value");
    const snapshot: Record<string, string> = {};
    if (settingsData) {
      (settingsData as any[]).forEach((r: any) => { snapshot[r.key] = r.value; });
    }
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("page_versions" as any).insert({
      created_by: session?.user?.id,
      created_by_email: session?.user?.email || "unknown",
      version_name: versionName.trim(),
      description: description.trim() || null,
      snapshot_json: snapshot,
    } as any);
    if (error) {
      toast({ title: "Erro ao salvar versão", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Versão salva!", description: `"${versionName}" foi salva com sucesso.` });
      await logAuditEntry({
        section: "settings",
        action_type: "create",
        field_name: "page_version",
        new_value: versionName.trim(),
      });
      setVersionName("");
      setDescription("");
      await fetchVersions();
    }
    setSaving(false);
  };

  const handleRestore = async (versionId: string, name: string) => {
    setRestoring(versionId);
    const { data: versionData } = await supabase
      .from("page_versions" as any)
      .select("snapshot_json")
      .eq("id", versionId)
      .single();
    if (!versionData) {
      toast({ title: "Erro", description: "Versão não encontrada.", variant: "destructive" });
      setRestoring(null);
      return;
    }
    const snapshot = (versionData as any).snapshot_json as Record<string, string>;
    const entries = Object.entries(snapshot).map(([key, value]) => ({
      key, value, updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from("site_settings" as any)
      .upsert(entries as any, { onConflict: "key" });
    if (error) {
      toast({ title: "Erro ao restaurar", description: error.message, variant: "destructive" });
      setRestoring(null);
      return;
    }
    await supabase
      .from("page_versions" as any)
      .update({ is_restored: true, restored_at: new Date().toISOString() } as any)
      .eq("id", versionId);
    await logAuditEntry({
      section: "version_restore",
      action_type: "restore",
      entity_key: versionId,
      field_name: "page_version",
      new_value: name,
      metadata: { version_id: versionId },
    });
    toast({ title: "Versão restaurada!", description: `"${name}" foi restaurada. A página será recarregada.` });
    setTimeout(() => { window.location.reload(); }, 1200);
  };

  const handleDeleteVersion = async (versionId: string, name: string) => {
    if (versions.length <= 1) {
      toast({ title: "Ação bloqueada", description: "Não é possível excluir a última versão existente.", variant: "destructive" });
      return;
    }
    setDeleting(versionId);
    const { error } = await supabase
      .from("page_versions" as any)
      .delete()
      .eq("id", versionId);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Versão excluída", description: `"${name}" foi removida.` });
      await logAuditEntry({
        section: "settings",
        action_type: "delete",
        field_name: "page_version",
        old_value: name,
        metadata: { version_id: versionId },
      });
      await fetchVersions();
    }
    setDeleting(null);
  };

  const handleCleanupOldVersions = async () => {
    const keep = parseInt(keepCount);
    if (versions.length <= keep) {
      toast({ title: "Nada para limpar", description: `Existem apenas ${versions.length} versão(ões). Nenhuma será removida.` });
      return;
    }
    setCleaningUp(true);
    // versions is already sorted newest first
    const toDelete = versions.slice(keep);
    const ids = toDelete.map(v => v.id);

    const { error } = await supabase
      .from("page_versions" as any)
      .delete()
      .in("id", ids);

    if (error) {
      toast({ title: "Erro na limpeza", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Limpeza concluída", description: `${ids.length} versão(ões) antiga(s) removida(s). As ${keep} mais recentes foram mantidas.` });
      await logAuditEntry({
        section: "settings",
        action_type: "delete",
        field_name: "page_version_cleanup",
        new_value: `Mantidas ${keep}, removidas ${ids.length}`,
      });
      await fetchVersions();
    }
    setCleaningUp(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      {/* Criar versão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Save className="h-5 w-5 text-primary" />
            Salvar Versão Atual
          </CardTitle>
          <CardDescription>
            Crie um snapshot da configuração atual da landing page. Você pode restaurá-lo depois.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome da Versão *</Label>
            <Input
              placeholder="Ex: Versão pré-campanha Black Friday"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição (opcional)</Label>
            <Textarea
              placeholder="Descreva o contexto desta versão..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <Button onClick={handleSaveVersion} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
            {saving ? "Salvando..." : "Salvar Versão"}
          </Button>
        </CardContent>
      </Card>

      {/* Limpeza inteligente */}
      {versions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eraser className="h-5 w-5 text-primary" />
              Limpeza Inteligente de Versões
            </CardTitle>
            <CardDescription>
              Mantenha apenas as versões mais recentes e remova as antigas automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 flex-wrap">
              <div className="space-y-1.5">
                <Label>Manter as últimas</Label>
                <Select value={keepCount} onValueChange={setKeepCount}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 versões</SelectItem>
                    <SelectItem value="5">5 versões</SelectItem>
                    <SelectItem value="10">10 versões</SelectItem>
                    <SelectItem value="20">20 versões</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={cleaningUp || versions.length <= parseInt(keepCount)}>
                    {cleaningUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eraser className="mr-2 h-4 w-4" />}
                    {versions.length > parseInt(keepCount)
                      ? `Remover ${versions.length - parseInt(keepCount)} versão(ões) antiga(s)`
                      : "Nada para limpar"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Limpar versões antigas?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso removerá {versions.length - parseInt(keepCount)} versão(ões) mais antiga(s),
                      mantendo as {keepCount} mais recentes. Essa ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCleanupOldVersions}>
                      Confirmar Limpeza
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Listar versões */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <RotateCcw className="h-5 w-5 text-primary" />
                Versões Salvas
              </CardTitle>
              <CardDescription>
                {versions.length} versão(ões) salva(s). Restaure ou exclua conforme necessário.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchVersions}>
              <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma versão salva ainda. Salve a primeira versão acima.
            </p>
          ) : (
            <div className="space-y-3">
              {versions.map((v) => (
                <div key={v.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{v.version_name}</span>
                      {v.is_restored && (
                        <Badge variant="outline" className="text-[10px]">
                          Restaurada {v.restored_at ? formatDate(v.restored_at) : ""}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(v.created_at)}</span>
                  </div>
                  {v.description && (
                    <p className="text-xs text-muted-foreground">{v.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Por: {v.created_by_email}</span>
                    <div className="flex gap-2">
                      {/* Delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={deleting === v.id || versions.length <= 1}
                            className="text-destructive hover:text-destructive">
                            {deleting === v.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Trash2 className="h-3 w-3" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir versão?</AlertDialogTitle>
                            <AlertDialogDescription>
                              A versão "{v.version_name}" será excluída permanentemente. Essa ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteVersion(v.id, v.version_name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {/* Restore */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={restoring === v.id}>
                            {restoring === v.id
                              ? <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              : <RotateCcw className="mr-2 h-3 w-3" />}
                            Restaurar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Restaurar versão?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Isso substituirá todas as configurações atuais do site pela versão "{v.version_name}".
                              Recomendamos salvar a versão atual antes de restaurar.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRestore(v.id, v.version_name)}>
                              Confirmar Restauração
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
