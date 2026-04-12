import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logAuditEntry } from "@/lib/auditLog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, RotateCcw, Archive, RefreshCw } from "lucide-react";
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
  const [versionName, setVersionName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const fetchVersions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("page_versions" as any)
      .select("id, created_at, created_by_email, version_name, description, is_restored, restored_at")
      .order("created_at", { ascending: false })
      .limit(50);
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

    // Capture current settings as snapshot
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

    // Fetch snapshot
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
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    // Upsert all settings from snapshot
    const { error } = await supabase
      .from("site_settings" as any)
      .upsert(entries as any, { onConflict: "key" });

    if (error) {
      toast({ title: "Erro ao restaurar", description: error.message, variant: "destructive" });
      setRestoring(null);
      return;
    }

    // Mark version as restored
    await supabase
      .from("page_versions" as any)
      .update({ is_restored: true, restored_at: new Date().toISOString() } as any)
      .eq("id", versionId);

    // Log audit
    await logAuditEntry({
      section: "version_restore",
      action_type: "restore",
      entity_key: versionId,
      field_name: "page_version",
      new_value: name,
      metadata: { version_id: versionId },
    });

    toast({
      title: "Versão restaurada!",
      description: `"${name}" foi restaurada. A página será recarregada.`,
    });

    // Force full reload so all admin components re-fetch settings from DB
    setTimeout(() => {
      window.location.reload();
    }, 1200);
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
                {versions.length} versão(ões) salva(s). Restaure qualquer uma para voltar ao estado anterior.
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={restoring === v.id}>
                          {restoring === v.id ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <RotateCcw className="mr-2 h-3 w-3" />
                          )}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
