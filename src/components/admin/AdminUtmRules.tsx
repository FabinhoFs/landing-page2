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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Play, Pause, Trash2, Link2, BarChart3, ArrowUpDown } from "lucide-react";

interface UtmRule {
  id: string;
  name: string;
  status: string;
  priority: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  overrides: Record<string, string>;
  created_at: string;
}

interface RuleStats {
  impressions: number;
  clicks: number;
  ctr: number;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativo",
  paused: "Pausado",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-green-500/20 text-green-700",
  paused: "bg-yellow-500/20 text-yellow-700",
};

const OVERRIDE_FIELDS = [
  { key: "hero_badge", label: "Badge da Hero", placeholder: "Ex: Oferta Google Ads" },
  { key: "hero_headline_line1", label: "Headline Linha 1", placeholder: "Ex: Certificado Digital para sua empresa" },
  { key: "hero_headline_line2", label: "Headline Linha 2", placeholder: "Ex: com desconto exclusivo." },
  { key: "hero_subheadline", label: "Subheadline", placeholder: "Ex: Aproveite a oferta especial da campanha." },
  { key: "hero_cta_primary", label: "CTA Primário (texto)", placeholder: "Ex: Aproveitar oferta" },
  { key: "hero_cta_secondary", label: "CTA Secundário (texto)", placeholder: "Ex: Falar com especialista" },
  { key: "cta_hero_message", label: "Mensagem WhatsApp (Hero CTA)", placeholder: "Ex: Olá! Vi a campanha do Google e quero meu certificado." },
  { key: "hero_dynamic_line", label: "Linha dinâmica", placeholder: "Ex: Oferta especial para {{cidade}}" },
  { key: "hero_fallback_line", label: "Linha fallback", placeholder: "Ex: Oferta especial para todo o Brasil" },
  { key: "pricing_highlight", label: "Destaque comercial", placeholder: "Ex: 🔥 Desconto exclusivo desta campanha" },
];

export const AdminUtmRules = () => {
  const [rules, setRules] = useState<UtmRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState<Record<string, RuleStats>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  // New rule form
  const [newName, setNewName] = useState("");
  const [newPriority, setNewPriority] = useState(10);
  const [newUtmSource, setNewUtmSource] = useState("");
  const [newUtmMedium, setNewUtmMedium] = useState("");
  const [newUtmCampaign, setNewUtmCampaign] = useState("");
  const [newUtmContent, setNewUtmContent] = useState("");
  const [newUtmTerm, setNewUtmTerm] = useState("");
  const [newOverrides, setNewOverrides] = useState<Record<string, string>>({});

  const fetchRules = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("utm_rules" as any)
      .select("*")
      .order("priority", { ascending: false });

    const parsed = ((data as any[]) || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      priority: r.priority,
      utm_source: r.utm_source,
      utm_medium: r.utm_medium,
      utm_campaign: r.utm_campaign,
      utm_content: r.utm_content,
      utm_term: r.utm_term,
      overrides: (r.overrides as Record<string, string>) || {},
      created_at: r.created_at,
    }));
    setRules(parsed);

    // Fetch stats
    const ruleIds = parsed.map(r => r.id);
    if (ruleIds.length > 0) {
      const { data: events } = await supabase
        .from("utm_events" as any)
        .select("rule_id, event_type")
        .in("rule_id", ruleIds);

      const sMap: Record<string, { impressions: number; clicks: number }> = {};
      ((events as any[]) || []).forEach((ev: any) => {
        if (!sMap[ev.rule_id]) sMap[ev.rule_id] = { impressions: 0, clicks: 0 };
        if (ev.event_type === "impression") sMap[ev.rule_id].impressions++;
        if (ev.event_type === "click") sMap[ev.rule_id].clicks++;
      });

      const formatted: Record<string, RuleStats> = {};
      Object.entries(sMap).forEach(([ruleId, s]) => {
        formatted[ruleId] = {
          impressions: s.impressions,
          clicks: s.clicks,
          ctr: s.impressions > 0 ? Math.round((s.clicks / s.impressions) * 10000) / 100 : 0,
        };
      });
      setStats(formatted);
    }

    setLoading(false);
  };

  useEffect(() => { fetchRules(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    if (!newUtmSource && !newUtmMedium && !newUtmCampaign && !newUtmContent && !newUtmTerm) {
      toast({ title: "Defina pelo menos um critério UTM", variant: "destructive" });
      return;
    }

    // Clean overrides: remove empty values
    const cleanOverrides: Record<string, string> = {};
    Object.entries(newOverrides).forEach(([k, v]) => {
      if (v && v.trim()) cleanOverrides[k] = v.trim();
    });

    if (Object.keys(cleanOverrides).length === 0) {
      toast({ title: "Defina pelo menos um campo de personalização", variant: "destructive" });
      return;
    }

    setCreating(true);

    const { error } = await supabase.from("utm_rules" as any).insert({
      name: newName.trim(),
      priority: newPriority,
      utm_source: newUtmSource.trim() || null,
      utm_medium: newUtmMedium.trim() || null,
      utm_campaign: newUtmCampaign.trim() || null,
      utm_content: newUtmContent.trim() || null,
      utm_term: newUtmTerm.trim() || null,
      overrides: cleanOverrides,
    } as any);

    if (error) {
      toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      setCreating(false);
      return;
    }

    await logAuditEntry({
      section: "utm_rules",
      action_type: "create",
      new_value: `Regra UTM "${newName}" criada (prioridade ${newPriority})`,
    });

    toast({ title: "Regra criada!" });
    resetForm();
    setCreating(false);
    fetchRules();
  };

  const resetForm = () => {
    setShowCreate(false);
    setNewName("");
    setNewPriority(10);
    setNewUtmSource("");
    setNewUtmMedium("");
    setNewUtmCampaign("");
    setNewUtmContent("");
    setNewUtmTerm("");
    setNewOverrides({});
  };

  const updateStatus = async (rule: UtmRule, newStatus: string) => {
    await supabase.from("utm_rules" as any)
      .update({ status: newStatus, updated_at: new Date().toISOString() } as any)
      .eq("id", rule.id);

    await logAuditEntry({
      section: "utm_rules",
      action_type: newStatus,
      entity_key: rule.id,
      old_value: rule.status,
      new_value: newStatus,
      field_name: "status",
    });

    toast({ title: `Regra ${STATUS_LABELS[newStatus] || newStatus}` });
    fetchRules();
  };

  const updateOverrides = async (rule: UtmRule, overrides: Record<string, string>) => {
    const cleanOverrides: Record<string, string> = {};
    Object.entries(overrides).forEach(([k, v]) => {
      if (v && v.trim()) cleanOverrides[k] = v.trim();
    });

    await supabase.from("utm_rules" as any)
      .update({ overrides: cleanOverrides, updated_at: new Date().toISOString() } as any)
      .eq("id", rule.id);

    await logAuditEntry({
      section: "utm_rules",
      action_type: "update",
      entity_key: rule.id,
      field_name: "overrides",
      new_value: JSON.stringify(cleanOverrides),
    });

    toast({ title: "Personalização salva!" });
    setEditingId(null);
    fetchRules();
  };

  const deleteRule = async (rule: UtmRule) => {
    await supabase.from("utm_events" as any).delete().eq("rule_id", rule.id);
    await supabase.from("utm_rules" as any).delete().eq("id", rule.id);

    await logAuditEntry({
      section: "utm_rules",
      action_type: "delete",
      entity_key: rule.id,
      old_value: rule.name,
    });

    toast({ title: "Regra excluída" });
    fetchRules();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" /> Personalização por UTM
          </h2>
          <p className="text-sm text-muted-foreground">Personalize conteúdo da landing page por campanha UTM.</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Regra
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Criar Regra UTM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nome da regra</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Google Ads - Barra Mansa" />
              </div>
              <div className="space-y-1.5">
                <Label>Prioridade (maior = vence)</Label>
                <Input type="number" value={newPriority} onChange={e => setNewPriority(parseInt(e.target.value) || 0)} />
              </div>
            </div>

            {/* UTM criteria */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Critérios UTM (preencha os que usar)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">utm_source</Label>
                  <Input value={newUtmSource} onChange={e => setNewUtmSource(e.target.value)} placeholder="google" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">utm_medium</Label>
                  <Input value={newUtmMedium} onChange={e => setNewUtmMedium(e.target.value)} placeholder="cpc" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">utm_campaign</Label>
                  <Input value={newUtmCampaign} onChange={e => setNewUtmCampaign(e.target.value)} placeholder="certificado-barra-mansa" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">utm_content</Label>
                  <Input value={newUtmContent} onChange={e => setNewUtmContent(e.target.value)} placeholder="headline-teste" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">utm_term</Label>
                  <Input value={newUtmTerm} onChange={e => setNewUtmTerm(e.target.value)} placeholder="certificado digital" />
                </div>
              </div>
            </div>

            {/* Overrides */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Campos personalizados (preencha apenas o que quiser mudar)</Label>
              <div className="space-y-3">
                {OVERRIDE_FIELDS.map(f => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <Input
                      value={newOverrides[f.key] || ""}
                      onChange={e => setNewOverrides(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Criar Regra
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Rules list */}
      {rules.length === 0 && !showCreate && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhuma regra UTM criada ainda.</CardContent></Card>
      )}

      {rules.map(rule => (
        <Card key={rule.id} className={rule.status === "active" ? "ring-2 ring-green-500/50" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">{rule.name}</CardTitle>
                <Badge className={STATUS_COLORS[rule.status]}>{STATUS_LABELS[rule.status]}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" /> P{rule.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {rule.status === "draft" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(rule, "active")}>
                    <Play className="mr-1 h-3 w-3" /> Ativar
                  </Button>
                )}
                {rule.status === "active" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(rule, "paused")}>
                    <Pause className="mr-1 h-3 w-3" /> Pausar
                  </Button>
                )}
                {rule.status === "paused" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(rule, "active")}>
                    <Play className="mr-1 h-3 w-3" /> Retomar
                  </Button>
                )}
                {(rule.status === "draft" || rule.status === "paused") && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir regra UTM?</AlertDialogTitle>
                        <AlertDialogDescription>
                          A regra e todos os eventos de tracking associados serão removidos permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteRule(rule)} className="bg-destructive text-destructive-foreground">
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
            {/* UTM criteria display */}
            <div className="flex flex-wrap gap-2">
              {rule.utm_source && <Badge variant="secondary">source: {rule.utm_source}</Badge>}
              {rule.utm_medium && <Badge variant="secondary">medium: {rule.utm_medium}</Badge>}
              {rule.utm_campaign && <Badge variant="secondary">campaign: {rule.utm_campaign}</Badge>}
              {rule.utm_content && <Badge variant="secondary">content: {rule.utm_content}</Badge>}
              {rule.utm_term && <Badge variant="secondary">term: {rule.utm_term}</Badge>}
            </div>

            {/* Overrides display / editor */}
            {editingId === rule.id ? (
              <OverrideEditor rule={rule} onSave={overrides => updateOverrides(rule, overrides)} onCancel={() => setEditingId(null)} />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Campos personalizados</Label>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(rule.id)}>Editar</Button>
                </div>
                {Object.keys(rule.overrides).length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum campo definido.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(rule.overrides).map(([k, v]) => {
                      const field = OVERRIDE_FIELDS.find(f => f.key === k);
                      return (
                        <div key={k} className="text-sm">
                          <span className="text-muted-foreground">{field?.label || k}:</span>{" "}
                          <span className="font-medium">{v}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            {stats[rule.id] && (
              <div className="flex items-center gap-4 text-sm border-t pt-3">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span>{stats[rule.id].impressions} impressões</span>
                <span>{stats[rule.id].clicks} cliques</span>
                <span className="font-semibold text-primary">{stats[rule.id].ctr}% CTR</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ─── Override Editor ────────────────────────────────
function OverrideEditor({
  rule,
  onSave,
  onCancel,
}: {
  rule: UtmRule;
  onSave: (overrides: Record<string, string>) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({ ...rule.overrides });

  return (
    <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
      <Label className="text-sm font-semibold">Editar personalização</Label>
      {OVERRIDE_FIELDS.map(f => (
        <div key={f.key} className="space-y-1">
          <Label className="text-xs text-muted-foreground">{f.label}</Label>
          <Input
            value={values[f.key] || ""}
            onChange={e => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
          />
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={() => onSave(values)}>Salvar</Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}
