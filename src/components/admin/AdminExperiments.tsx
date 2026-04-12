import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logAuditEntry } from "@/lib/auditLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Play, Pause, Square, Trash2, FlaskConical, BarChart3 } from "lucide-react";

interface Variant {
  id?: string;
  variant_key: string;
  label: string;
  config: Record<string, string>;
}

interface Experiment {
  id: string;
  name: string;
  section: string;
  experiment_type: string;
  status: string;
  traffic_split: Record<string, number>;
  created_at: string;
  ended_at: string | null;
  variants: Variant[];
}

interface EventStats {
  variant_key: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

const SECTIONS = [
  { value: "hero", label: "Hero" },
  { value: "cta_hero", label: "CTA Hero" },
  { value: "cta_header", label: "CTA Header" },
  { value: "cta_offers", label: "CTA Ofertas" },
];

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativo",
  paused: "Pausado",
  ended: "Encerrado",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-green-500/20 text-green-700",
  paused: "bg-yellow-500/20 text-yellow-700",
  ended: "bg-red-500/20 text-red-700",
};

export const AdminExperiments = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState<Record<string, EventStats[]>>({});
  const { toast } = useToast();

  // New experiment form
  const [newName, setNewName] = useState("");
  const [newSection, setNewSection] = useState("hero");
  const [newType, setNewType] = useState("content");
  const [newVariants, setNewVariants] = useState<Variant[]>([
    { variant_key: "A", label: "Variante A", config: {} },
    { variant_key: "B", label: "Variante B", config: {} },
  ]);
  const [showCreate, setShowCreate] = useState(false);

  const fetchExperiments = async () => {
    setLoading(true);
    const { data: expRows } = await supabase
      .from("experiments" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (!expRows) { setLoading(false); return; }

    const exps: Experiment[] = [];
    for (const exp of expRows as any[]) {
      const { data: varRows } = await supabase
        .from("experiment_variants" as any)
        .select("*")
        .eq("experiment_id", exp.id);

      exps.push({
        ...exp,
        traffic_split: exp.traffic_split || {},
        variants: ((varRows as any[]) || []).map((v: any) => ({
          id: v.id,
          variant_key: v.variant_key,
          label: v.label,
          config: v.config || {},
        })),
      });
    }
    setExperiments(exps);

    // Fetch stats for active/paused experiments
    const activeIds = exps.filter(e => e.status === "active" || e.status === "paused" || e.status === "ended").map(e => e.id);
    if (activeIds.length > 0) {
      const { data: events } = await supabase
        .from("experiment_events" as any)
        .select("experiment_id, variant_key, event_type")
        .in("experiment_id", activeIds);

      const statsMap: Record<string, Record<string, { impressions: number; clicks: number }>> = {};
      ((events as any[]) || []).forEach((ev: any) => {
        if (!statsMap[ev.experiment_id]) statsMap[ev.experiment_id] = {};
        if (!statsMap[ev.experiment_id][ev.variant_key]) statsMap[ev.experiment_id][ev.variant_key] = { impressions: 0, clicks: 0 };
        if (ev.event_type === "impression") statsMap[ev.experiment_id][ev.variant_key].impressions++;
        if (ev.event_type === "click") statsMap[ev.experiment_id][ev.variant_key].clicks++;
      });

      const formatted: Record<string, EventStats[]> = {};
      Object.entries(statsMap).forEach(([expId, variants]) => {
        formatted[expId] = Object.entries(variants).map(([vk, s]) => ({
          variant_key: vk,
          impressions: s.impressions,
          clicks: s.clicks,
          ctr: s.impressions > 0 ? Math.round((s.clicks / s.impressions) * 10000) / 100 : 0,
        })).sort((a, b) => a.variant_key.localeCompare(b.variant_key));
      });
      setStats(formatted);
    }

    setLoading(false);
  };

  useEffect(() => { fetchExperiments(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    setCreating(true);

    const split: Record<string, number> = {};
    const pct = Math.floor(100 / newVariants.length);
    newVariants.forEach((v, i) => {
      split[v.variant_key] = i === 0 ? 100 - (pct * (newVariants.length - 1)) : pct;
    });

    const { data: inserted, error } = await supabase
      .from("experiments" as any)
      .insert({ name: newName, section: newSection, experiment_type: newType, traffic_split: split } as any)
      .select("id")
      .single();

    if (error || !inserted) {
      toast({ title: "Erro ao criar", description: error?.message, variant: "destructive" });
      setCreating(false);
      return;
    }

    const expId = (inserted as any).id;
    const variantRows = newVariants.map(v => ({
      experiment_id: expId,
      variant_key: v.variant_key,
      label: v.label,
      config: v.config,
    }));

    await supabase.from("experiment_variants" as any).insert(variantRows as any);

    await logAuditEntry({
      section: "experiments",
      action_type: "create",
      entity_key: expId,
      new_value: `Experimento "${newName}" criado para ${newSection}`,
    });

    toast({ title: "Experimento criado!" });
    setShowCreate(false);
    setNewName("");
    setNewVariants([
      { variant_key: "A", label: "Variante A", config: {} },
      { variant_key: "B", label: "Variante B", config: {} },
    ]);
    setCreating(false);
    fetchExperiments();
  };

  const updateStatus = async (exp: Experiment, newStatus: string) => {
    const updates: any = { status: newStatus, updated_at: new Date().toISOString() };
    if (newStatus === "ended") updates.ended_at = new Date().toISOString();

    await supabase.from("experiments" as any).update(updates).eq("id", exp.id);

    await logAuditEntry({
      section: "experiments",
      action_type: newStatus,
      entity_key: exp.id,
      old_value: exp.status,
      new_value: newStatus,
      field_name: "status",
    });

    toast({ title: `Experimento ${STATUS_LABELS[newStatus] || newStatus}` });
    fetchExperiments();
  };

  const deleteExperiment = async (exp: Experiment) => {
    await supabase.from("experiment_events" as any).delete().eq("experiment_id", exp.id);
    await supabase.from("experiment_variants" as any).delete().eq("experiment_id", exp.id);
    await supabase.from("experiments" as any).delete().eq("id", exp.id);

    await logAuditEntry({
      section: "experiments",
      action_type: "delete",
      entity_key: exp.id,
      old_value: exp.name,
    });

    toast({ title: "Experimento excluído" });
    fetchExperiments();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" /> Experimentos A/B/C
          </h2>
          <p className="text-sm text-muted-foreground">Crie e gerencie testes para otimizar conversão.</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Experimento
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Criar Experimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Hero Headline Test" />
              </div>
              <div className="space-y-1.5">
                <Label>Seção</Label>
                <Select value={newSection} onValueChange={setNewSection}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content">Conteúdo (Hero variant)</SelectItem>
                    <SelectItem value="cta_text">Texto do CTA</SelectItem>
                    <SelectItem value="cta_message">Mensagem WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Variantes</Label>
                {newVariants.length < 3 && (
                  <Button size="sm" variant="outline" onClick={() => {
                    const nextKey = String.fromCharCode(65 + newVariants.length);
                    setNewVariants([...newVariants, { variant_key: nextKey, label: `Variante ${nextKey}`, config: {} }]);
                  }}>
                    <Plus className="mr-1 h-3 w-3" /> Variante
                  </Button>
                )}
              </div>
              {newVariants.map((v, i) => (
                <div key={v.variant_key} className="flex items-center gap-2">
                  <Badge variant="outline" className="shrink-0 w-8 justify-center">{v.variant_key}</Badge>
                  <Input value={v.label} onChange={e => {
                    const updated = [...newVariants];
                    updated[i] = { ...v, label: e.target.value };
                    setNewVariants(updated);
                  }} placeholder="Descrição da variante" className="flex-1" />
                  {newVariants.length > 2 && (
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => {
                      setNewVariants(newVariants.filter((_, j) => j !== i));
                    }}><Trash2 className="h-4 w-4" /></Button>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Após criar, edite as configurações de cada variante (hero_active_variant, texto CTA, mensagem, etc.)
              </p>
            </div>

            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Criar Experimento
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Experiments list */}
      {experiments.length === 0 && !showCreate && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum experimento criado ainda.</CardContent></Card>
      )}

      {experiments.map(exp => (
        <Card key={exp.id} className={exp.status === "active" ? "ring-2 ring-green-500/50" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">{exp.name}</CardTitle>
                <Badge className={STATUS_COLORS[exp.status]}>{STATUS_LABELS[exp.status]}</Badge>
                <Badge variant="outline">{SECTIONS.find(s => s.value === exp.section)?.label || exp.section}</Badge>
              </div>
              <div className="flex items-center gap-2">
                {exp.status === "draft" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(exp, "active")}>
                    <Play className="mr-1 h-3 w-3" /> Ativar
                  </Button>
                )}
                {exp.status === "active" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(exp, "paused")}>
                    <Pause className="mr-1 h-3 w-3" /> Pausar
                  </Button>
                )}
                {exp.status === "paused" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(exp, "active")}>
                      <Play className="mr-1 h-3 w-3" /> Retomar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(exp, "ended")}>
                      <Square className="mr-1 h-3 w-3" /> Encerrar
                    </Button>
                  </>
                )}
                {(exp.status === "draft" || exp.status === "ended") && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir experimento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Todos os dados, variantes e eventos deste experimento serão removidos permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteExperiment(exp)} className="bg-destructive text-destructive-foreground">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Variants config */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Variantes e Configuração</Label>
              {exp.variants.map(v => (
                <VariantConfigEditor
                  key={v.variant_key}
                  experiment={exp}
                  variant={v}
                  onSaved={fetchExperiments}
                />
              ))}
            </div>

            {/* Traffic split */}
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Distribuição de Tráfego</Label>
              <div className="flex gap-3">
                {Object.entries(exp.traffic_split).sort(([a],[b]) => a.localeCompare(b)).map(([k, pct]) => (
                  <div key={k} className="flex items-center gap-1 text-sm">
                    <Badge variant="outline">{k}</Badge> {pct}%
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            {stats[exp.id] && stats[exp.id].length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" /> Resultados
                </Label>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2 pr-4">Variante</th>
                        <th className="text-right py-2 px-4">Impressões</th>
                        <th className="text-right py-2 px-4">Cliques</th>
                        <th className="text-right py-2 pl-4">CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats[exp.id].map(s => {
                        const best = stats[exp.id].reduce((a, b) => a.ctr > b.ctr ? a : b);
                        const isBest = s.variant_key === best.variant_key && s.clicks > 0;
                        return (
                          <tr key={s.variant_key} className={`border-b ${isBest ? "bg-green-500/10" : ""}`}>
                            <td className="py-2 pr-4 font-medium">
                              {s.variant_key} {isBest && <span className="text-green-600 text-xs ml-1">🏆 Líder</span>}
                            </td>
                            <td className="text-right py-2 px-4">{s.impressions}</td>
                            <td className="text-right py-2 px-4">{s.clicks}</td>
                            <td className="text-right py-2 pl-4 font-bold">{s.ctr}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Criado em {new Date(exp.created_at).toLocaleString("pt-BR")}
              {exp.ended_at && ` • Encerrado em ${new Date(exp.ended_at).toLocaleString("pt-BR")}`}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Sub-component for editing variant config inline
function VariantConfigEditor({ experiment, variant, onSaved }: { experiment: Experiment; variant: Variant; onSaved: () => void }) {
  const [configJson, setConfigJson] = useState(JSON.stringify(variant.config, null, 2));
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsed = JSON.parse(configJson);
      await supabase
        .from("experiment_variants" as any)
        .update({ config: parsed } as any)
        .eq("id", variant.id);

      await logAuditEntry({
        section: "experiments",
        action_type: "update_variant",
        entity_key: experiment.id,
        field_name: `variant_${variant.variant_key}`,
        new_value: configJson,
      });

      toast({ title: `Variante ${variant.variant_key} salva!` });
      onSaved();
    } catch {
      toast({ title: "JSON inválido", variant: "destructive" });
    }
    setSaving(false);
  };

  // Provide config hints based on experiment type/section
  const placeholder = experiment.section === "hero"
    ? '{"hero_active_variant": "1"}'
    : experiment.experiment_type === "cta_text"
    ? '{"cta_text": "Iniciar agora"}'
    : '{"cta_message": "Olá! Quero meu certificado."}';

  return (
    <div className="flex flex-col sm:flex-row gap-2 p-3 rounded-lg bg-muted/50 border">
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className="w-8 justify-center">{variant.variant_key}</Badge>
        <span className="text-sm text-muted-foreground">{variant.label}</span>
      </div>
      <Textarea
        value={configJson}
        onChange={e => setConfigJson(e.target.value)}
        className="flex-1 font-mono text-xs min-h-[60px]"
        placeholder={placeholder}
        disabled={experiment.status === "active"}
      />
      {experiment.status !== "active" && (
        <Button size="sm" onClick={handleSave} disabled={saving} className="self-end">
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Salvar"}
        </Button>
      )}
    </div>
  );
}
