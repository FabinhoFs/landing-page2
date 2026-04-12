import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Download, Trash2, BarChart3, MapPin, MousePointerClick, TrendingUp,
  Trophy, Target, Filter, FileText, Smartphone, Monitor, Layers,
  Clock, CalendarDays, Activity, Zap,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { jsPDF } from "jspdf";

type Period = "today" | "7d" | "30d";
type ProductFilter = "all" | "cpf" | "cnpj";

interface LogEntry {
  id: string;
  button_id: string;
  ip: string | null;
  city: string | null;
  region: string | null;
  device: string | null;
  user_agent: string | null;
  created_at: string;
}

// ─── CTA REGISTRY ───────────────────────────────────────────
interface CtaDefinition {
  id: string;
  label: string;
  section: string;
  sectionOrder: number;
}

const CTA_REGISTRY: CtaDefinition[] = [
  { id: "cta_header", label: "Header — CTA Fixo", section: "Header", sectionOrder: 0 },
  { id: "cta_hero_primary", label: "Hero — CTA Principal", section: "Hero", sectionOrder: 1 },
  { id: "cta_hero_secondary", label: "Hero — CTA Secundário", section: "Hero", sectionOrder: 1 },
  { id: "cta_pain", label: "Dores — CTA", section: "Dores", sectionOrder: 2 },
  { id: "cta_pricing_e-cpfa1", label: "Ofertas — Card e-CPF", section: "Ofertas", sectionOrder: 3 },
  { id: "cta_pricing_e-cnpja1", label: "Ofertas — Card e-CNPJ", section: "Ofertas", sectionOrder: 3 },
  { id: "cta_guarantee", label: "Segurança — CTA", section: "Segurança", sectionOrder: 4 },
  { id: "cta_faq", label: "FAQ — CTA", section: "FAQ", sectionOrder: 5 },
  { id: "cta_bottom", label: "CTA Final — Botão Principal", section: "CTA Final", sectionOrder: 6 },
  { id: "cta_floating", label: "WhatsApp Flutuante", section: "Flutuante", sectionOrder: 7 },
  { id: "cta_sticky_mobile", label: "Barra Mobile Fixa", section: "Mobile", sectionOrder: 8 },
  { id: "cta_exit_popup", label: "Pop-up de Saída", section: "Pop-up", sectionOrder: 9 },
];

const CTA_LABEL_MAP: Record<string, string> = {};
const CTA_SECTION_MAP: Record<string, string> = {};
CTA_REGISTRY.forEach((c) => {
  CTA_LABEL_MAP[c.id] = c.label;
  CTA_SECTION_MAP[c.id] = c.section;
});

const getCtaLabel = (id: string) => CTA_LABEL_MAP[id] || id;
const getCtaSection = (id: string) => CTA_SECTION_MAP[id] || "Outros";

const COLORS_MIXED = [
  "hsl(142, 70%, 40%)", "hsl(200, 60%, 50%)", "hsl(280, 54%, 33%)",
  "hsl(30, 80%, 55%)", "hsl(350, 65%, 50%)", "hsl(180, 50%, 45%)",
  "hsl(60, 70%, 45%)", "hsl(310, 50%, 55%)", "hsl(220, 60%, 55%)",
  "hsl(15, 70%, 50%)", "hsl(160, 55%, 40%)", "hsl(270, 50%, 60%)",
];

const SECTION_COLORS: Record<string, string> = {
  Header: "hsl(220, 60%, 55%)",
  Hero: "hsl(280, 54%, 33%)",
  Dores: "hsl(350, 65%, 50%)",
  Ofertas: "hsl(142, 70%, 40%)",
  Segurança: "hsl(200, 60%, 50%)",
  FAQ: "hsl(30, 80%, 55%)",
  "CTA Final": "hsl(180, 50%, 45%)",
  Flutuante: "hsl(142, 50%, 50%)",
  Mobile: "hsl(310, 50%, 55%)",
  "Pop-up": "hsl(60, 70%, 45%)",
  Outros: "hsl(0, 0%, 60%)",
};

const periodLabel: Record<Period, string> = {
  today: "Hoje",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
};

const productLabel: Record<ProductFilter, string> = {
  all: "Todos",
  cpf: "e-CPF",
  cnpj: "e-CNPJ",
};

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const getStartDate = (period: Period) => {
  const now = new Date();
  if (period === "today") now.setHours(0, 0, 0, 0);
  else if (period === "7d") now.setDate(now.getDate() - 7);
  else now.setDate(now.getDate() - 30);
  return now.toISOString();
};

const filterByProduct = (logs: LogEntry[], filter: ProductFilter) => {
  if (filter === "all") return logs;
  if (filter === "cpf") return logs.filter((l) => l.button_id.toLowerCase().includes("cpf"));
  return logs.filter((l) => l.button_id.toLowerCase().includes("cnpj"));
};

// Truncate helper with full text available
const TruncatedText = ({ text, maxLen = 28 }: { text: string; maxLen?: number }) => {
  if (text.length <= maxLen) return <span>{text}</span>;
  return (
    <TooltipProvider delayDuration={200}>
      <UiTooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{text.slice(0, maxLen)}…</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </UiTooltip>
    </TooltipProvider>
  );
};

export const AdminDashboard = () => {
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [period, setPeriod] = useState<Period>("7d");
  const [product, setProduct] = useState<ProductFilter>("all");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    const startDate = getStartDate(period);
    const { data, error } = await supabase
      .from("access_logs")
      .select("*")
      .gte("created_at", startDate)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar logs", description: error.message, variant: "destructive" });
    } else {
      setAllLogs((data as LogEntry[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [period]);

  const logs = useMemo(() => filterByProduct(allLogs, product), [allLogs, product]);
  const totalClicks = logs.length;

  // ─── DERIVED DATA ──────────────────────────────────
  const topCta = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => { map[l.button_id] = (map[l.button_id] || 0) + 1; });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { id: sorted[0][0], name: getCtaLabel(sorted[0][0]), count: sorted[0][1] } : null;
  }, [logs]);

  const topCity = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => {
      const label = [l.city, l.region].filter(Boolean).join(", ") || "Desconhecida";
      map[label] = (map[label] || 0) + 1;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { name: sorted[0][0], count: sorted[0][1] } : null;
  }, [logs]);

  const deviceStats = useMemo(() => {
    let mobile = 0, desktop = 0;
    logs.forEach((l) => { if (l.device === "Mobile") mobile++; else desktop++; });
    return { mobile, desktop, total: mobile + desktop };
  }, [logs]);

  const lastInteraction = useMemo(() => {
    if (logs.length === 0) return null;
    const last = logs[0];
    return {
      date: new Date(last.created_at).toLocaleString("pt-BR"),
      cta: getCtaLabel(last.button_id),
      city: [last.city, last.region].filter(Boolean).join(", ") || "—",
    };
  }, [logs]);

  // Per-CTA table data
  const ctaTableData = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => { map[l.button_id] = (map[l.button_id] || 0) + 1; });
    return CTA_REGISTRY.map((cta) => ({
      ...cta,
      clicks: map[cta.id] || 0,
      pct: totalClicks > 0 ? ((map[cta.id] || 0) / totalClicks * 100) : 0,
    })).sort((a, b) => b.clicks - a.clicks);
  }, [logs, totalClicks]);

  // Section aggregation
  const sectionData = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => {
      const section = getCtaSection(l.button_id);
      map[section] = (map[section] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value, fill: SECTION_COLORS[name] || "hsl(0,0%,60%)" }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  // Per-CTA bar chart
  const buttonData = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => { map[l.button_id] = (map[l.button_id] || 0) + 1; });
    return Object.entries(map)
      .map(([id, total], i) => ({ id, name: getCtaLabel(id), total, fill: COLORS_MIXED[i % COLORS_MIXED.length] }))
      .sort((a, b) => b.total - a.total);
  }, [logs]);

  // Volume chart (timeline)
  const volumeData = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => {
      const key = period === "today"
        ? new Date(l.created_at).getHours().toString().padStart(2, "0") + "h"
        : new Date(l.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, total]) => ({ name, total })).sort((a, b) => a.name.localeCompare(b.name));
  }, [logs, period]);

  // City data — full city + UF
  const cityData = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => {
      const label = [l.city, l.region].filter(Boolean).join(", ") || "Desconhecida";
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [logs]);

  // Hourly distribution
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i.toString().padStart(2, "0")}h`, total: 0 }));
    logs.forEach((l) => {
      const h = new Date(l.created_at).getHours();
      hours[h].total++;
    });
    return hours;
  }, [logs]);

  // Day of week distribution
  const dayOfWeekData = useMemo(() => {
    const days = DAY_NAMES.map((name) => ({ name, total: 0 }));
    logs.forEach((l) => {
      const d = new Date(l.created_at).getDay();
      days[d].total++;
    });
    return days;
  }, [logs]);

  // Product breakdown (e-CPF vs e-CNPJ vs other)
  const productData = useMemo(() => {
    let cpf = 0, cnpj = 0, other = 0;
    logs.forEach((l) => {
      const id = l.button_id.toLowerCase();
      if (id.includes("cpf")) cpf++;
      else if (id.includes("cnpj")) cnpj++;
      else other++;
    });
    return [
      { name: "e-CPF", value: cpf, fill: "hsl(200, 60%, 50%)" },
      { name: "e-CNPJ", value: cnpj, fill: "hsl(142, 70%, 40%)" },
      { name: "Outros CTAs", value: other, fill: "hsl(280, 54%, 33%)" },
    ].filter((d) => d.value > 0);
  }, [logs]);

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
  };

  // ─── Export CSV ─────────────
  const exportCSV = () => {
    const header = "Data,CTA (técnico),CTA (amigável),Seção,Cidade,UF,Dispositivo,IP\n";
    const rows = logs.map((l) =>
      `"${new Date(l.created_at).toLocaleString("pt-BR")}","${l.button_id}","${getCtaLabel(l.button_id)}","${getCtaSection(l.button_id)}","${l.city || ""}","${l.region || ""}","${l.device || ""}","${l.ip || ""}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `relatorio_${period}_${product}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Export PDF ─────────────
  const exportPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const m = 15;
    let y = m;
    pdf.setFontSize(18); pdf.setTextColor(40, 40, 40);
    pdf.text("Relatório de Performance — Agis Digital", m, y + 8);
    pdf.setFontSize(11); pdf.setTextColor(100);
    pdf.text(`Período: ${periodLabel[period]}  |  Produto: ${productLabel[product]}`, m, y + 15);
    pdf.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, m, y + 21);
    y += 28;
    pdf.setDrawColor(200); pdf.line(m, y, w - m, y); y += 8;
    pdf.setFontSize(12); pdf.setTextColor(40); pdf.text("Resumo", m, y); y += 7;
    pdf.setFontSize(10); pdf.setTextColor(60);
    pdf.text(`Total de Cliques: ${totalClicks}`, m, y); y += 6;
    pdf.text(`CTA Mais Clicado: ${topCta?.name || "—"} (${topCta?.count || 0} cliques)`, m, y); y += 6;
    pdf.text(`Cidade Líder: ${topCity?.name || "—"} (${topCity?.count || 0} cliques)`, m, y); y += 6;
    pdf.text(`Mobile: ${deviceStats.mobile} (${deviceStats.total ? Math.round(deviceStats.mobile / deviceStats.total * 100) : 0}%)  |  Desktop: ${deviceStats.desktop} (${deviceStats.total ? Math.round(deviceStats.desktop / deviceStats.total * 100) : 0}%)`, m, y);
    y += 10;
    pdf.setDrawColor(200); pdf.line(m, y, w - m, y); y += 8;
    pdf.setFontSize(11); pdf.setTextColor(40); pdf.text("Performance por CTA", m, y); y += 7;
    pdf.setFontSize(8); pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(60, 60, 60);
    pdf.rect(m, y - 4, w - 2 * m, 7, "F");
    const cols = [m, m + 60, m + 90, m + 115];
    pdf.text("CTA", cols[0] + 1, y);
    pdf.text("Seção", cols[1] + 1, y);
    pdf.text("Cliques", cols[2] + 1, y);
    pdf.text("%", cols[3] + 1, y);
    y += 6;
    pdf.setTextColor(50);
    ctaTableData.forEach((row, i) => {
      if (row.clicks === 0) return;
      if (y > 270) { pdf.addPage(); y = 15; }
      if (i % 2 === 0) { pdf.setFillColor(245, 245, 245); pdf.rect(m, y - 4, w - 2 * m, 6, "F"); }
      pdf.setFontSize(7);
      pdf.text(row.label, cols[0] + 1, y);
      pdf.text(row.section, cols[1] + 1, y);
      pdf.text(String(row.clicks), cols[2] + 1, y);
      pdf.text(row.pct.toFixed(1) + "%", cols[3] + 1, y);
      y += 6;
    });
    pdf.save(`relatorio_${period}_${product}.pdf`);
    toast({ title: "PDF gerado com sucesso!" });
  };

  const clearOldLogs = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { error } = await supabase.from("access_logs").delete().lt("created_at", thirtyDaysAgo.toISOString());
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Logs antigos removidos!" }); fetchLogs(); }
  };

  // Best hour
  const bestHour = useMemo(() => {
    const best = hourlyData.reduce((a, b) => a.total > b.total ? a : b, hourlyData[0]);
    return best.total > 0 ? best : null;
  }, [hourlyData]);

  // Best day
  const bestDay = useMemo(() => {
    const best = dayOfWeekData.reduce((a, b) => a.total > b.total ? a : b, dayOfWeekData[0]);
    return best.total > 0 ? best : null;
  }, [dayOfWeekData]);

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">📊 Inteligência de Conversão</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Analise quais CTAs, seções, horários e origens geram mais cliques na sua landing page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["today", "7d", "30d"] as Period[]).map((p) => (
            <Button key={p} size="sm" variant={period === p ? "default" : "outline"} onClick={() => setPeriod(p)}>
              {periodLabel[p]}
            </Button>
          ))}
        </div>
      </div>

      {/* Product filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Produto:</span>
        {(["all", "cpf", "cnpj"] as ProductFilter[]).map((p) => (
          <Button key={p} size="sm" variant={product === p ? "secondary" : "ghost"} onClick={() => setProduct(p)}>
            {productLabel[p]}
          </Button>
        ))}
      </div>

      {/* ─── 6 SUMMARY CARDS ──────────────────────── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total clicks */}
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <MousePointerClick className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-foreground">{totalClicks}</p>
              <p className="text-xs text-muted-foreground">Total de Cliques</p>
            </div>
          </CardContent>
        </Card>

        {/* Top CTA */}
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "hsla(142, 70%, 40%, 0.1)" }}>
              <Trophy className="h-5 w-5" style={{ color: "hsl(142, 70%, 40%)" }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground leading-tight">
                <TruncatedText text={topCta?.name || "—"} maxLen={22} />
              </p>
              <p className="text-xs text-muted-foreground">CTA Mais Clicado{topCta ? ` (${topCta.count})` : ""}</p>
            </div>
          </CardContent>
        </Card>

        {/* Top City */}
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "hsla(200, 60%, 50%, 0.1)" }}>
              <MapPin className="h-5 w-5" style={{ color: "hsl(200, 60%, 50%)" }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground leading-tight">
                <TruncatedText text={topCity?.name || "—"} maxLen={22} />
              </p>
              <p className="text-xs text-muted-foreground">Cidade Líder{topCity ? ` (${topCity.count})` : ""}</p>
            </div>
          </CardContent>
        </Card>

        {/* Mobile % */}
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "hsla(30, 80%, 55%, 0.1)" }}>
              <Smartphone className="h-5 w-5" style={{ color: "hsl(30, 80%, 55%)" }} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground">
                {deviceStats.total ? Math.round(deviceStats.mobile / deviceStats.total * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Mobile ({deviceStats.mobile})</p>
            </div>
          </CardContent>
        </Card>

        {/* Best hour */}
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "hsla(280, 54%, 33%, 0.1)" }}>
              <Clock className="h-5 w-5" style={{ color: "hsl(280, 54%, 33%)" }} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground">{bestHour ? bestHour.hour : "—"}</p>
              <p className="text-xs text-muted-foreground">Melhor Horário{bestHour ? ` (${bestHour.total})` : ""}</p>
            </div>
          </CardContent>
        </Card>

        {/* Best day */}
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "hsla(350, 65%, 50%, 0.1)" }}>
              <CalendarDays className="h-5 w-5" style={{ color: "hsl(350, 65%, 50%)" }} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground">{bestDay ? bestDay.name : "—"}</p>
              <p className="text-xs text-muted-foreground">Melhor Dia{bestDay ? ` (${bestDay.total})` : ""}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── LAST INTERACTION ──────────────────────── */}
      {lastInteraction && (
        <Card className="border-dashed">
          <CardContent className="flex flex-wrap items-center gap-4 py-3">
            <Activity className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Última interação:</span>
            <Badge variant="secondary" className="text-xs">{lastInteraction.date}</Badge>
            <Badge variant="outline" className="text-xs">{lastInteraction.cta}</Badge>
            <Badge variant="outline" className="text-xs">{lastInteraction.city}</Badge>
          </CardContent>
        </Card>
      )}

      {/* ─── CTA TABLE ──────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Mapa Completo de CTAs Rastreados
          </CardTitle>
          <CardDescription>Todos os pontos de conversão da landing page com cliques, seção e participação relativa.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-3 font-semibold text-muted-foreground">CTA</th>
                  <th className="py-2 pr-3 font-semibold text-muted-foreground">Seção</th>
                  <th className="py-2 pr-3 font-semibold text-muted-foreground text-right">Cliques</th>
                  <th className="py-2 pr-3 font-semibold text-muted-foreground text-right">%</th>
                  <th className="py-2 font-semibold text-muted-foreground min-w-[120px]">Participação</th>
                </tr>
              </thead>
              <tbody>
                {ctaTableData.map((row) => (
                  <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-3">
                      <div>
                        <p className="font-medium text-foreground whitespace-nowrap">
                          <TruncatedText text={row.label} maxLen={35} />
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 font-mono">{row.id}</p>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <Badge variant="outline" className="text-[11px] whitespace-nowrap" style={{
                        borderColor: (SECTION_COLORS[row.section] || "hsl(0,0%,60%)") + "40",
                        color: SECTION_COLORS[row.section] || "hsl(0,0%,60%)",
                      }}>
                        {row.section}
                      </Badge>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-bold text-foreground">{row.clicks}</td>
                    <td className="py-2.5 pr-3 text-right text-muted-foreground">{row.pct.toFixed(1)}%</td>
                    <td className="py-2.5">
                      <div className="h-2 w-full max-w-[120px] rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(row.pct, 100)}%`,
                            backgroundColor: SECTION_COLORS[row.section] || "hsl(var(--primary))",
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── SECTION + GEOGRAPHIC ──────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section aggregation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4" />
              Conversão por Seção da Página
            </CardTitle>
            <CardDescription>Qual área da landing page gera mais cliques? Ajuda a priorizar otimizações.</CardDescription>
          </CardHeader>
          <CardContent>
            {sectionData.length > 0 ? (
              <div className="space-y-3">
                {sectionData.map((s) => {
                  const pct = totalClicks > 0 ? (s.value / totalClicks * 100) : 0;
                  return (
                    <div key={s.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{s.name}</span>
                        <span className="text-muted-foreground">{s.value} cliques ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: s.fill }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-10 text-center text-muted-foreground">Sem dados no período.</p>
            )}
          </CardContent>
        </Card>

        {/* Geographic — chart + ranking table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Origem Geográfica — Top 10 Cidades
            </CardTitle>
            <CardDescription>Cidades com mais interações (Cidade, UF).</CardDescription>
          </CardHeader>
          <CardContent>
            {cityData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={cityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                      {cityData.map((_, i) => <Cell key={i} fill={COLORS_MIXED[i % COLORS_MIXED.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Ranking table */}
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {cityData.map((c, i) => {
                    const pct = totalClicks > 0 ? (c.value / totalClicks * 100) : 0;
                    return (
                      <div key={c.name} className="flex items-center gap-2 text-sm">
                        <span className="w-5 text-right text-muted-foreground font-mono text-xs">{i + 1}.</span>
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS_MIXED[i % COLORS_MIXED.length] }} />
                        <span className="font-medium text-foreground flex-1 min-w-0">
                          <TruncatedText text={c.name} maxLen={30} />
                        </span>
                        <span className="text-muted-foreground whitespace-nowrap">{c.value} ({pct.toFixed(1)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="py-10 text-center text-muted-foreground">Sem dados.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── HOURLY + DAY OF WEEK ──────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hourly distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Distribuição por Hora do Dia
            </CardTitle>
            <CardDescription>Em quais horários os visitantes mais clicam? Ajuda a programar campanhas.</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={1} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="total" fill="hsl(280, 54%, 33%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-muted-foreground">Sem dados.</p>
            )}
          </CardContent>
        </Card>

        {/* Day of week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" />
              Distribuição por Dia da Semana
            </CardTitle>
            <CardDescription>Quais dias geram mais cliques? Ajuda a ajustar orçamento de mídia.</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="total" fill="hsl(350, 65%, 50%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-muted-foreground">Sem dados.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── VOLUME TIMELINE ──────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Evolução Temporal — {period === "today" ? "Cliques por Hora" : "Cliques por Dia"}
          </CardTitle>
          <CardDescription>
            {period === "today"
              ? "Distribuição dos cliques ao longo do dia."
              : "Tendência de cliques no período. Identifique picos e quedas para avaliar o impacto de alterações na LP ou nas campanhas."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="total" stroke="hsl(200, 60%, 50%)" strokeWidth={2} dot={{ fill: "hsl(200, 60%, 50%)", r: 4 }} activeDot={{ r: 6 }} name="Cliques" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-muted-foreground">{loading ? "Carregando..." : "Sem dados no período."}</p>
          )}
        </CardContent>
      </Card>

      {/* ─── CTA BAR + PRODUCT BREAKDOWN ──────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* CTA bar chart — 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" />
              Ranking de CTAs por Cliques
            </CardTitle>
            <CardDescription>Comparação direta entre todos os botões de conversão. O mais longo = mais clicado.</CardDescription>
          </CardHeader>
          <CardContent>
            {buttonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(300, buttonData.length * 40)}>
                <BarChart data={buttonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={200} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]} name="Cliques">
                    {buttonData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-muted-foreground">Sem dados.</p>
            )}
          </CardContent>
        </Card>

        {/* Product breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              Interesse por Produto
            </CardTitle>
            <CardDescription>e-CPF vs e-CNPJ — qual produto gera mais intenção de compra?</CardDescription>
          </CardHeader>
          <CardContent>
            {productData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={productData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {productData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {productData.map((p) => (
                    <div key={p.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.fill }} />
                        <span className="font-medium text-foreground">{p.name}</span>
                      </div>
                      <span className="text-muted-foreground">{p.value} cliques</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-10 text-center text-muted-foreground">Sem dados.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── DEVICE BREAKDOWN ──────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold text-foreground">{deviceStats.mobile}</p>
              <p className="text-sm text-muted-foreground">Cliques via Mobile ({deviceStats.total ? Math.round(deviceStats.mobile / deviceStats.total * 100) : 0}%)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Monitor className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold text-foreground">{deviceStats.desktop}</p>
              <p className="text-sm text-muted-foreground">Cliques via Desktop ({deviceStats.total ? Math.round(deviceStats.desktop / deviceStats.total * 100) : 0}%)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── ACTIONS ──────────────────────────────── */}
      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        <Button onClick={exportPDF} disabled={logs.length === 0} className="gap-2">
          <FileText className="h-4 w-4" /> Gerar Relatório em PDF
        </Button>
        <Button variant="outline" onClick={exportCSV} disabled={logs.length === 0} className="gap-2">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
        <Button variant="outline" onClick={clearOldLogs} className="gap-2">
          <Trash2 className="h-4 w-4" /> Limpar logs &gt; 30 dias
        </Button>
      </div>
    </div>
  );
};
