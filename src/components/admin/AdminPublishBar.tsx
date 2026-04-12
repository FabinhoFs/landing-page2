import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logAuditEntry } from "@/lib/auditLog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
import { Loader2, Upload, Undo2, FileEdit, CheckCircle2, Clock, Eye } from "lucide-react";

export const AdminPublishBar = () => {
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [lastPublished, setLastPublished] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [changedCount, setChangedCount] = useState(0);
  const { toast } = useToast();

  const checkDraftStatus = useCallback(async () => {
    try {
      const { data: draftData } = await supabase
        .from("site_settings" as any)
        .select("key, value")
        .eq("environment", "draft");
      const { data: pubData } = await supabase
        .from("site_settings" as any)
        .select("key, value")
        .eq("environment", "published");

      const draftMap: Record<string, string> = {};
      const pubMap: Record<string, string> = {};
      if (draftData) (draftData as any[]).forEach((r: any) => { draftMap[r.key] = r.value; });
      if (pubData) (pubData as any[]).forEach((r: any) => { pubMap[r.key] = r.value; });

      // Check if any draft value differs from published
      const allKeys = new Set([...Object.keys(draftMap), ...Object.keys(pubMap)]);
      let differs = false;
      let count = 0;
      allKeys.forEach((k) => {
        if (k === "__last_published_at") return;
        if (draftMap[k] !== pubMap[k]) {
          differs = true;
          count++;
        }
      });

      // Also detect keys that exist only in draft (new keys)
      // or only in published (deleted keys) — both are changes
      setHasDraftChanges(differs);
      setChangedCount(count);
      setLastPublished(pubMap["__last_published_at"] || null);
    } catch {
      // ignore
    }
    setChecking(false);
  }, []);

  // Initial check + re-check every 3 seconds for responsiveness
  useEffect(() => {
    checkDraftStatus();
    const interval = setInterval(checkDraftStatus, 3000);
    return () => clearInterval(interval);
  }, [checkDraftStatus]);

  // Listen for custom event dispatched by useAdminSettings after save
  useEffect(() => {
    const handler = () => { checkDraftStatus(); };
    window.addEventListener("draft-saved", handler);
    return () => window.removeEventListener("draft-saved", handler);
  }, [checkDraftStatus]);

  const handlePreview = () => {
    // Open landing page with ?preview=draft param
    // The Index page will detect this + admin auth to show draft content
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}/?preview=draft`, "_blank");
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const { data: draftOnly } = await supabase
        .from("site_settings" as any)
        .select("key, value")
        .eq("environment", "draft");

      if (!draftOnly || (draftOnly as any[]).length === 0) {
        toast({ title: "Nada para publicar", description: "Não há rascunho para publicar.", variant: "destructive" });
        setPublishing(false);
        return;
      }

      const now = new Date().toISOString();
      const entries = (draftOnly as any[]).map((r: any) => ({
        key: r.key,
        value: r.value,
        environment: "published",
        updated_at: now,
      }));

      // Also save the publish timestamp
      entries.push({
        key: "__last_published_at",
        value: now,
        environment: "published",
        updated_at: now,
      });
      entries.push({
        key: "__last_published_at",
        value: now,
        environment: "draft",
        updated_at: now,
      });

      const { error } = await supabase
        .from("site_settings" as any)
        .upsert(entries as any, { onConflict: "key,environment" });

      if (error) {
        toast({ title: "Erro ao publicar", description: error.message, variant: "destructive" });
        setPublishing(false);
        return;
      }

      await logAuditEntry({
        section: "publish",
        action_type: "publish",
        field_name: "all_settings",
        new_value: `Publicação em ${new Date().toLocaleString("pt-BR")}`,
      });

      toast({ title: "Publicado com sucesso!", description: "As alterações estão no ar." });
      setHasDraftChanges(false);
      setChangedCount(0);
      setLastPublished(now);
    } catch {
      toast({ title: "Erro", description: "Falha ao publicar.", variant: "destructive" });
    }
    setPublishing(false);
  };

  const handleDiscard = async () => {
    setDiscarding(true);
    try {
      const { data: pubData } = await supabase
        .from("site_settings" as any)
        .select("key, value")
        .eq("environment", "published");

      if (!pubData || (pubData as any[]).length === 0) {
        toast({ title: "Nada para descartar", variant: "destructive" });
        setDiscarding(false);
        return;
      }

      const entries = (pubData as any[]).map((r: any) => ({
        key: r.key,
        value: r.value,
        environment: "draft",
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("site_settings" as any)
        .upsert(entries as any, { onConflict: "key,environment" });

      if (error) {
        toast({ title: "Erro ao descartar", description: error.message, variant: "destructive" });
        setDiscarding(false);
        return;
      }

      await logAuditEntry({
        section: "publish",
        action_type: "discard_draft",
        field_name: "all_settings",
        new_value: "Rascunho descartado",
      });

      toast({ title: "Rascunho descartado", description: "O conteúdo voltou para a versão publicada. A página será recarregada." });
      setTimeout(() => { window.location.reload(); }, 1200);
    } catch {
      toast({ title: "Erro", description: "Falha ao descartar.", variant: "destructive" });
    }
    setDiscarding(false);
  };

  if (checking) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <FileEdit className="h-3.5 w-3.5" />
            Modo Rascunho
          </Badge>
          {hasDraftChanges ? (
            <span className="text-sm text-amber-500 font-medium flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {changedCount} alteração{changedCount !== 1 ? "ões" : ""} não publicada{changedCount !== 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-sm text-emerald-500 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Rascunho sincronizado
            </span>
          )}
          {lastPublished && (
            <span className="text-xs text-muted-foreground">
              Última publicação: {new Date(lastPublished).toLocaleString("pt-BR")}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {/* Preview button — always available */}
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="mr-2 h-3.5 w-3.5" />
            Previsualizar
          </Button>

          {hasDraftChanges && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={discarding}>
                  {discarding ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Undo2 className="mr-2 h-3.5 w-3.5" />}
                  Descartar Rascunho
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Descartar rascunho?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Todas as alterações não publicadas serão perdidas. O conteúdo voltará para a versão que está no ar.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDiscard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Descartar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={publishing || !hasDraftChanges}>
                {publishing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-2 h-3.5 w-3.5" />}
                Publicar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Publicar alterações?</AlertDialogTitle>
                <AlertDialogDescription>
                  O rascunho atual será copiado para produção. As alterações ficarão visíveis imediatamente na página pública.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handlePublish}>Confirmar Publicação</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
