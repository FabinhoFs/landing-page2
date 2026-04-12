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
  Clock, CalendarDays, Activity, Zap, Globe, MessageSquare, Flame,
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

  // ─── UTM PARSING ─────────────────────────────────
  const parseUtm = (ua: string | null): Record<string, string> | null => {
    if (!ua) return null;
    const idx = ua.indexOf("|||");
    if (idx === -1) return null;
    try { return JSON.parse(ua.substring(idx + 3)); } catch { return null; }
  };

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

  // ─── UTM ANALYTICS ─────────────────────────────────
  const utmData = useMemo(() => {
    const sources: Record<string, number> = {};
    const campaigns: Record<string, number> = {};
    const mediums: Record<string, number> = {};
    let utmCount = 0;
    logs.forEach((l) => {
      const utm = parseUtm(l.user_agent);
      if (!utm) return;
      utmCount++;
      if (utm.utm_source) sources[utm.utm_source] = (sources[utm.utm_source] || 0) + 1;
      if (utm.utm_campaign) campaigns[utm.utm_campaign] = (campaigns[utm.utm_campaign] || 0) + 1;
      if (utm.utm_medium) mediums[utm.utm_medium] = (mediums[utm.utm_medium] || 0) + 1;
    });
    return {
      utmCount,
      sources: Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 10),
      campaigns: Object.entries(campaigns).sort((a, b) => b[1] - a[1]).slice(0, 10),
      mediums: Object.entries(mediums).sort((a, b) => b[1] - a[1]).slice(0, 10),
    };
  }, [logs]);

  // ─── CTA MESSAGE RANKING ──────────────────────────
  const [ctaMessages, setCtaMessages] = useState<Record<string, string>>({});
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings" as any).select("key, value");
      if (data) {
        const map: Record<string, string> = {};
        (data as any[]).forEach((r: any) => { map[r.key] = r.value; });
        setCtaMessages(map);
      }
    })();
  }, []);

  const ctaMessageRanking = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => { map[l.button_id] = (map[l.button_id] || 0) + 1; });
    const CTA_KEY_MAP: Record<string, string> = {
      cta_hero_primary: "cta_hero", cta_hero_secondary: "cta_hero",
      cta_header: "cta_header", cta_pain: "cta_pain",
      "cta_pricing_e-cpfa1": "cta_ecpf", "cta_pricing_e-cnpja1": "cta_ecnpj",
      cta_guarantee: "cta_guarantee", cta_faq: "cta_faq",
      cta_bottom: "cta_bottom", cta_floating: "cta_floating",
      cta_sticky_mobile: "cta_sticky_mobile", cta_exit_popup: "cta_exit_popup",
    };
    const msgList: { message: string; clicks: number; section: string; ctaLabel: string }[] = [];
    Object.entries(map).forEach(([btnId, clicks]) => {
      const msgKey = CTA_KEY_MAP[btnId] || btnId;
      const message = ctaMessages[msgKey] || "Mensagem padrão";
      msgList.push({
        message: message.replace(/\{cidade\}/g, "…"),
        clicks, section: getCtaSection(btnId), ctaLabel: getCtaLabel(btnId),
      });
    });
    return msgList.sort((a, b) => b.clicks - a.clicks);
  }, [logs, ctaMessages]);

  // ─── HEATMAP DATA ──────────────────────────────────
  const heatmapData = useMemo(() => {
    const sectionOrder = ["Header", "Hero", "Dores", "Ofertas", "Segurança", "FAQ", "CTA Final", "Flutuante", "Mobile", "Pop-up"];
    const map: Record<string, number> = {};
    logs.forEach((l) => { const s = getCtaSection(l.button_id); map[s] = (map[s] || 0) + 1; });
    const maxClicks = Math.max(...Object.values(map), 1);
    return sectionOrder.map((name) => ({
      name, clicks: map[name] || 0,
      pct: totalClicks > 0 ? ((map[name] || 0) / totalClicks * 100) : 0,
      intensity: (map[name] || 0) / maxClicks,
    }));
  }, [logs, totalClicks]);

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

      {/* ─── SUMMARY CARDS — 2 ROWS of 3 ──────────── */}
      <div className="space-y-4">
        {/* Row 1 */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 hover:scale-110 hover:rotate-3">
                <MousePointerClick className="h-6 w-6 text-primary animate-[bounce_2s_ease-in-out_infinite]" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-3xl font-bold text-foreground leading-none">{totalClicks}</p>
                <p className="text-sm font-medium text-muted-foreground">Total de Cliques</p>
                <p className="text-xs text-muted-foreground/60">Todos os CTAs no período</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-110 hover:-rotate-3" style={{ backgroundColor: "hsla(142, 70%, 40%, 0.1)" }}>
                <Trophy className="h-6 w-6 animate-[pulse_3s_ease-in-out_infinite]" style={{ color: "hsl(142, 70%, 40%)" }} />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-base font-bold text-foreground leading-snug">
                  <TruncatedText text={topCta?.name || "—"} maxLen={32} />
                </p>
                <p className="text-sm font-medium text-muted-foreground">CTA Mais Clicado</p>
                <p className="text-xs text-muted-foreground/60">{topCta ? `${topCta.count} cliques no período` : "Sem dados"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-110 hover:rotate-3" style={{ backgroundColor: "hsla(200, 60%, 50%, 0.1)" }}>
                <MapPin className="h-6 w-6 animate-[bounce_2.5s_ease-in-out_infinite_0.5s]" style={{ color: "hsl(200, 60%, 50%)" }} />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-base font-bold text-foreground leading-snug">
                  <TruncatedText text={topCity?.name || "—"} maxLen={32} />
                </p>
                <p className="text-sm font-medium text-muted-foreground">Cidade Líder</p>
                <p className="text-xs text-muted-foreground/60">{topCity ? `${topCity.count} interações` : "Sem dados"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2 */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-110 hover:-rotate-3" style={{ backgroundColor: "hsla(30, 80%, 55%, 0.1)" }}>
                <Smartphone className="h-6 w-6 animate-[pulse_2.5s_ease-in-out_infinite_0.3s]" style={{ color: "hsl(30, 80%, 55%)" }} />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-3xl font-bold text-foreground leading-none">
                  {deviceStats.total ? Math.round(deviceStats.mobile / deviceStats.total * 100) : 0}%
                </p>
                <p className="text-sm font-medium text-muted-foreground">Acessos Mobile</p>
                <p className="text-xs text-muted-foreground/60">{deviceStats.mobile} mobile · {deviceStats.desktop} desktop</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-110 hover:rotate-6" style={{ backgroundColor: "hsla(280, 54%, 33%, 0.1)" }}>
                <Clock className="h-6 w-6 animate-[spin_8s_linear_infinite]" style={{ color: "hsl(280, 54%, 33%)" }} />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-3xl font-bold text-foreground leading-none">{bestHour ? bestHour.hour : "—"}</p>
                <p className="text-sm font-medium text-muted-foreground">Melhor Horário</p>
                <p className="text-xs text-muted-foreground/60">{bestHour ? `${bestHour.total} cliques neste horário` : "Sem dados"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-110 hover:-rotate-6" style={{ backgroundColor: "hsla(350, 65%, 50%, 0.1)" }}>
                <CalendarDays className="h-6 w-6 animate-[pulse_3s_ease-in-out_infinite_0.8s]" style={{ color: "hsl(350, 65%, 50%)" }} />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-3xl font-bold text-foreground leading-none">{bestDay ? bestDay.name : "—"}</p>
                <p className="text-sm font-medium text-muted-foreground">Melhor Dia da Semana</p>
                <p className="text-xs text-muted-foreground/60">{bestDay ? `${bestDay.total} cliques neste dia` : "Sem dados"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
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

      {/* ─── HEATMAP VISUAL ────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="h-4 w-4" />
            Mapa de Calor por Seção
          </CardTitle>
          <CardDescription>Intensidade de cliques em cada área da landing page. Quanto mais quente, mais cliques.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {heatmapData.map((s) => {
              const r = Math.round(255 * s.intensity);
              const g = Math.round(100 * (1 - s.intensity));
              const b = Math.round(50 * (1 - s.intensity));
              const bgColor = s.clicks > 0
                ? `rgba(${r}, ${g}, ${b}, ${0.15 + s.intensity * 0.6})`
                : "hsl(var(--muted))";
              const textColor = s.intensity > 0.5 ? `rgb(${r}, ${g}, ${b})` : "hsl(var(--foreground))";
              return (
                <div
                  key={s.name}
                  className="rounded-lg p-4 text-center transition-all hover:scale-105"
                  style={{ backgroundColor: bgColor }}
                >
                  <p className="text-2xl font-bold" style={{ color: textColor }}>{s.pct.toFixed(0)}%</p>
                  <p className="text-xs font-medium text-muted-foreground mt-1">{s.name}</p>
                  <p className="text-xs text-muted-foreground/60">{s.clicks} cliques</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── CTA MESSAGE RANKING ──────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Ranking de Mensagens de CTA
          </CardTitle>
          <CardDescription>Qual mensagem de WhatsApp mais gera ação? Compare abordagens comerciais.</CardDescription>
        </CardHeader>
        <CardContent>
          {ctaMessageRanking.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-3 font-semibold text-muted-foreground">#</th>
                    <th className="py-2 pr-3 font-semibold text-muted-foreground">CTA</th>
                    <th className="py-2 pr-3 font-semibold text-muted-foreground">Mensagem</th>
                    <th className="py-2 pr-3 font-semibold text-muted-foreground text-right">Cliques</th>
                  </tr>
                </thead>
                <tbody>
                  {ctaMessageRanking.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5 pr-3">
                        <p className="font-medium text-foreground text-xs">{row.ctaLabel}</p>
                        <Badge variant="outline" className="text-[10px] mt-0.5">{row.section}</Badge>
                      </td>
                      <td className="py-2.5 pr-3">
                        <p className="text-xs text-muted-foreground max-w-xs truncate" title={row.message}>
                          "{row.message}"
                        </p>
                      </td>
                      <td className="py-2.5 pr-3 text-right font-bold text-foreground">{row.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-6 text-center text-muted-foreground">Sem dados no período.</p>
          )}
        </CardContent>
      </Card>

      {/* ─── UTM ANALYTICS ────────────────────────── */}
      {utmData.utmCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Análise de UTMs — Origem do Tráfego
            </CardTitle>
            <CardDescription>
              {utmData.utmCount} cliques com UTM detectados. Entenda de onde vem o tráfego pago.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Sources */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Origens (utm_source)</h4>
                {utmData.sources.length > 0 ? (
                  <div className="space-y-2">
                    {utmData.sources.map(([name, count]) => (
                      <div key={name} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{name}</span>
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-muted-foreground">Sem dados</p>}
              </div>
              {/* Mediums */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Mídia (utm_medium)</h4>
                {utmData.mediums.length > 0 ? (
                  <div className="space-y-2">
                    {utmData.mediums.map(([name, count]) => (
                      <div key={name} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{name}</span>
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-muted-foreground">Sem dados</p>}
              </div>
              {/* Campaigns */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Campanhas (utm_campaign)</h4>
                {utmData.campaigns.length > 0 ? (
                  <div className="space-y-2">
                    {utmData.campaigns.map(([name, count]) => (
                      <div key={name} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground truncate max-w-[150px]" title={name}>{name}</span>
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-muted-foreground">Sem dados</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {utmData.utmCount === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex items-center gap-3 py-4">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">UTM não detectado</p>
              <p className="text-xs text-muted-foreground">
                Adicione ?utm_source=google&utm_medium=cpc&utm_campaign=nome nos links das campanhas para rastrear origens.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
