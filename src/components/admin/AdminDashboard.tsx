import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Download, Trash2, BarChart3, MapPin, MousePointerClick, TrendingUp,
  Trophy, Target, Filter,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

type Period = "today" | "7d" | "30d";
type ProductFilter = "all" | "cpf" | "cnpj";

interface LogEntry {
  id: string;
  button_id: string;
  ip: string | null;
  city: string | null;
  user_agent: string | null;
  created_at: string;
}

const COLORS = [
  "hsl(142, 70%, 40%)", "hsl(200, 60%, 50%)", "hsl(280, 54%, 33%)",
  "hsl(30, 80%, 55%)", "hsl(350, 65%, 50%)", "hsl(180, 50%, 45%)",
  "hsl(60, 70%, 45%)", "hsl(310, 50%, 55%)", "hsl(220, 55%, 55%)",
  "hsl(280, 46%, 46%)",
];

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

const CTA_LABELS: Record<string, string> = {
  cta_hero: "Botão Hero",
  cta_ecpf: "Card e-CPF",
  cta_ecnpj: "Card e-CNPJ",
  cta_floating: "Botão Flutuante",
  cta_exit: "Pop-up de Saída",
  cta_mobile: "CTA Mobile",
  cta_benefits: "Seção Benefícios",
  cta_faq: "Seção FAQ",
};

const getCtaLabel = (id: string) => CTA_LABELS[id] || id;

const getStartDate = (period: Period) => {
  const now = new Date();
  if (period === "today") {
    now.setHours(0, 0, 0, 0);
  } else if (period === "7d") {
    now.setDate(now.getDate() - 7);
  } else {
    now.setDate(now.getDate() - 30);
  }
  return now.toISOString();
};

const filterByProduct = (logs: LogEntry[], filter: ProductFilter) => {
  if (filter === "all") return logs;
  if (filter === "cpf") return logs.filter((l) => l.button_id.toLowerCase().includes("cpf"));
  return logs.filter((l) => l.button_id.toLowerCase().includes("cnpj"));
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
      setAllLogs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [period]);

  const logs = useMemo(() => filterByProduct(allLogs, product), [allLogs, product]);

  // --- Widgets ---
  const totalClicks = logs.length;

  const topCta = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => { map[l.button_id] = (map[l.button_id] || 0) + 1; });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { name: getCtaLabel(sorted[0][0]), count: sorted[0][1] } : null;
  }, [logs]);

  const topCity = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => {
      const city = l.city || "Desconhecida";
      map[city] = (map[city] || 0) + 1;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { name: sorted[0][0], count: sorted[0][1] } : null;
  }, [logs]);

  const popupRate = useMemo(() => {
    if (logs.length === 0) return 0;
    const popupClicks = logs.filter((l) => l.button_id === "cta_exit").length;
    return Math.round((popupClicks / logs.length) * 100);
  }, [logs]);

  // --- Charts ---
  const volumeData = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => {
      const key = period === "today"
        ? new Date(l.created_at).getHours().toString().padStart(2, "0") + "h"
        : new Date(l.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [logs, period]);

  const cityData = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => {
      const city = l.city || "Desconhecida";
      map[city] = (map[city] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [logs]);

  const buttonData = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => { map[l.button_id] = (map[l.button_id] || 0) + 1; });
    return Object.entries(map)
      .map(([id, total]) => ({ name: getCtaLabel(id), total }))
      .sort((a, b) => b.total - a.total);
  }, [logs]);

  const exportCSV = () => {
    const header = "Data,CTA,Cidade,IP\n";
    const rows = logs.map((l) =>
      `"${new Date(l.created_at).toLocaleString("pt-BR")}","${getCtaLabel(l.button_id)}","${l.city || ""}","${l.ip || ""}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_${period}_${product}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearOldLogs = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { error } = await supabase
      .from("access_logs")
      .delete()
      .lt("created_at", thirtyDaysAgo.toISOString());
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logs antigos removidos!" });
      fetchLogs();
    }
  };

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
  };

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-foreground">📊 Dashboard de Performance</h2>
        <div className="flex flex-wrap gap-2">
          {(["today", "7d", "30d"] as Period[]).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "default" : "outline"}
              onClick={() => setPeriod(p)}
            >
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
          <Button
            key={p}
            size="sm"
            variant={product === p ? "secondary" : "ghost"}
            onClick={() => setProduct(p)}
          >
            {productLabel[p]}
          </Button>
        ))}
      </div>

      {/* 4 Summary Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <MousePointerClick className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{totalClicks}</p>
              <p className="text-sm text-muted-foreground">Total de Cliques</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: "hsla(142, 70%, 40%, 0.1)" }}>
              <Trophy className="h-6 w-6" style={{ color: "hsl(142, 70%, 40%)" }} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground truncate max-w-[140px]">{topCta?.name || "—"}</p>
              <p className="text-sm text-muted-foreground">CTA Campeão {topCta ? `(${topCta.count})` : ""}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: "hsla(200, 60%, 50%, 0.1)" }}>
              <MapPin className="h-6 w-6" style={{ color: "hsl(200, 60%, 50%)" }} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground truncate max-w-[140px]">{topCity?.name || "—"}</p>
              <p className="text-sm text-muted-foreground">Cidade Top 1 {topCity ? `(${topCity.count})` : ""}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: "hsla(30, 80%, 55%, 0.1)" }}>
              <Target className="h-6 w-6" style={{ color: "hsl(30, 80%, 55%)" }} />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{popupRate}%</p>
              <p className="text-sm text-muted-foreground">Conversão Pop-up</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line chart - Volume over time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Volume de Cliques {period === "today" ? "por Hora" : "por Dia"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(200, 60%, 50%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(200, 60%, 50%)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-muted-foreground">{loading ? "Carregando..." : "Sem dados no período."}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance by CTA - Bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" />
              Performance por CTA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {buttonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={buttonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="total" fill="hsl(142, 70%, 40%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-muted-foreground">Sem dados.</p>
            )}
          </CardContent>
        </Card>

        {/* Geographic origin - Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Origem Geográfica
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {cityData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-muted-foreground">Sem dados.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        <Button onClick={exportCSV} disabled={logs.length === 0} className="gap-2">
          <Download className="h-4 w-4" /> Exportar Relatório
        </Button>
        <Button variant="outline" onClick={clearOldLogs} className="gap-2">
          <Trash2 className="h-4 w-4" /> Limpar logs &gt; 30 dias
        </Button>
      </div>
    </div>
  );
};
