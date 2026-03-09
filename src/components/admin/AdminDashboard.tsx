import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Trash2, BarChart3, MapPin, MousePointerClick } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

type Period = "today" | "7d" | "30d";

interface LogEntry {
  id: string;
  button_id: string;
  ip: string | null;
  city: string | null;
  user_agent: string | null;
  created_at: string;
}

const COLORS = [
  "hsl(280, 54%, 33%)", "hsl(280, 46%, 46%)", "hsl(142, 70%, 40%)",
  "hsl(200, 60%, 50%)", "hsl(30, 80%, 55%)", "hsl(350, 65%, 50%)",
  "hsl(180, 50%, 45%)", "hsl(60, 70%, 45%)", "hsl(310, 50%, 55%)",
  "hsl(220, 55%, 55%)",
];

const periodLabel: Record<Period, string> = {
  today: "Hoje",
  "7d": "7 dias",
  "30d": "30 dias",
};

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

export const AdminDashboard = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [period, setPeriod] = useState<Period>("7d");
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
      setLogs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [period]);

  // Volume by day/hour
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

  // Top 10 cities
  const cityData = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => {
      const city = l.city || "Desconhecida";
      map[city] = (map[city] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [logs]);

  // Clicks by button
  const buttonData = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => { map[l.button_id] = (map[l.button_id] || 0) + 1; });
    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [logs]);

  const exportCSV = () => {
    const header = "id,button_id,ip,city,user_agent,created_at\n";
    const rows = logs.map((l) =>
      `"${l.id}","${l.button_id}","${l.ip || ""}","${l.city || ""}","${(l.user_agent || "").replace(/"/g, '""')}","${l.created_at}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `access_logs_${period}.csv`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Inteligência Comercial</h2>
        <div className="flex gap-2">
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

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{logs.length}</p>
              <p className="text-sm text-muted-foreground">Total de acessos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <MapPin className="h-8 w-8 text-secondary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{cityData.length}</p>
              <p className="text-sm text-muted-foreground">Cidades diferentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <MousePointerClick className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{buttonData.length}</p>
              <p className="text-sm text-muted-foreground">CTAs clicados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volume chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Volume de acessos {period === "today" ? "por hora" : "por dia"}</CardTitle>
        </CardHeader>
        <CardContent>
          {volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="total" fill="hsl(280, 54%, 33%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-muted-foreground">{loading ? "Carregando..." : "Sem dados no período."}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top cities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 10 cidades</CardTitle>
          </CardHeader>
          <CardContent>
            {cityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={cityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {cityData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-muted-foreground">Sem dados.</p>
            )}
          </CardContent>
        </Card>

        {/* Clicks by button */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliques por CTA</CardTitle>
          </CardHeader>
          <CardContent>
            {buttonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={buttonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="total" fill="hsl(142, 70%, 40%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-muted-foreground">Sem dados.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={exportCSV} disabled={logs.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
        <Button variant="destructive" onClick={clearOldLogs}>
          <Trash2 className="mr-2 h-4 w-4" /> Limpar logs &gt; 30 dias
        </Button>
      </div>
    </div>
  );
};
