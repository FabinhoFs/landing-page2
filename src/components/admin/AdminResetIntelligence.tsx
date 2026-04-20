import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, RotateCcw, Loader2 } from "lucide-react";
import { logAuditEntry } from "@/lib/auditLog";

const TARGET_TABLES = [
  "access_logs",
  "experiment_events",
  "utm_events",
  "system_errors",
] as const;

const CONFIRM_WORD = "RESETAR";

interface AdminResetIntelligenceProps {
  onComplete?: () => void;
}

export const AdminResetIntelligence = ({ onComplete }: AdminResetIntelligenceProps) => {
  const { toast } = useToast();
  const [step1Open, setStep1Open] = useState(false);
  const [step2Open, setStep2Open] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStep1Confirm = () => {
    setStep1Open(false);
    setConfirmText("");
    setStep2Open(true);
  };

  const handleFinalReset = async () => {
    if (confirmText.trim() !== CONFIRM_WORD) {
      toast({
        title: "Confirmação inválida",
        description: `Digite exatamente "${CONFIRM_WORD}" para prosseguir.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const results: Record<string, { ok: boolean; error?: string }> = {};

    for (const table of TARGET_TABLES) {
      const { error } = await supabase
        .from(table as any)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      results[table] = { ok: !error, error: error?.message };
    }

    const failed = Object.entries(results).filter(([, r]) => !r.ok);
    setLoading(false);

    if (failed.length > 0) {
      const msg = failed.map(([t, r]) => `${t}: ${r.error}`).join(" | ");
      toast({
        title: "Reset parcial — algumas tabelas falharam",
        description: msg,
        variant: "destructive",
      });
    } else {
      await logAuditEntry({
        section: "Inteligência",
        action_type: "reset",
        entity_key: "telemetry_reset",
        field_name: "all_telemetry_tables",
        new_value: TARGET_TABLES.join(", "),
        metadata: { tables: TARGET_TABLES, timestamp: new Date().toISOString() },
      });
      toast({
        title: "✅ Inteligência zerada com sucesso!",
        description: "Todas as 4 tabelas de telemetria foram limpas. Conteúdo, configurações e auditoria foram preservados.",
      });
    }

    setStep2Open(false);
    setConfirmText("");
    onComplete?.();
  };

  return (
    <>
      {/* ── Step 1: First confirmation ────────────────────────── */}
      <AlertDialog open={step1Open} onOpenChange={setStep1Open}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset de Inteligência
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Atenção — Ação Irreversível
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  Esta ação <strong>apagará permanentemente</strong> todos os dados
                  de telemetria das 4 tabelas abaixo:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-foreground">
                  <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">access_logs</code> — cliques, IPs, origem, dispositivo</li>
                  <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">experiment_events</code> — eventos de A/B testing</li>
                  <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">utm_events</code> — rastreamento de campanhas UTM</li>
                  <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">system_errors</code> — log de erros do sistema</li>
                </ul>
                <div className="rounded-md border border-border bg-muted/40 p-3 text-xs">
                  <p className="font-semibold text-foreground mb-1">✅ Será preservado:</p>
                  <p className="text-muted-foreground">
                    Conteúdo da landing page, configurações, integrações, administradores,
                    versões publicadas e histórico de auditoria.
                  </p>
                </div>
                <p className="text-destructive font-medium">
                  Use esta função apenas entre campanhas para zerar métricas e começar uma nova análise do zero.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStep1Confirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Entendi, prosseguir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Step 2: Type-to-confirm ───────────────────────────── */}
      <Dialog
        open={step2Open}
        onOpenChange={(open) => {
          if (!loading) {
            setStep2Open(open);
            if (!open) setConfirmText("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmação Final
            </DialogTitle>
            <DialogDescription>
              Para confirmar o reset completo da inteligência, digite a palavra{" "}
              <strong className="text-destructive font-mono">{CONFIRM_WORD}</strong> abaixo:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-reset">Palavra de confirmação</Label>
            <Input
              id="confirm-reset"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              autoComplete="off"
              autoFocus
              disabled={loading}
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStep2Open(false);
                setConfirmText("");
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleFinalReset}
              disabled={loading || confirmText.trim() !== CONFIRM_WORD}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Zerando...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" /> Zerar Inteligência
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
