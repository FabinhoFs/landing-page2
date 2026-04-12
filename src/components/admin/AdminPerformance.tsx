import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Zap, Globe, Shield, Trash2, CheckCircle, AlertTriangle, Info,
  Cloud, Server, Lock, Rocket, Copy, ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const CLOUDFLARE_STEPS = [
  {
    title: "1. Adicionar domínio ao Cloudflare",
    content: `Acesse dash.cloudflare.com → "Add a Site" → digite seu domínio (ex: agisdigital.com) → escolha o plano Free → siga o assistente para atualizar os nameservers no seu registrador de domínio.`,
  },
  {
    title: "2. Ativar Proxy (ícone laranja)",
    content: `Em DNS → registros A/CNAME do seu domínio → clique no ícone de nuvem até ficar laranja (Proxied). Isso ativa cache e proteção DDoS. Nunca deixe "DNS only" (cinza) para o domínio principal.`,
  },
  {
    title: "3. Configurar Cache",
    content: `Vá em Caching → Configuration:\n• Cache Level: Standard\n• Browser Cache TTL: 4 hours (ou mais)\n• Always Online: ON\n\nEm Page Rules, crie uma regra para o domínio principal:\n• URL: agisdigital.com/*\n• Cache Level: Cache Everything\n• Edge Cache TTL: 2 hours`,
  },
  {
    title: "4. Ativar Brotli",
    content: `Speed → Optimization → Content Optimization → Brotli: ON.\nBrotli oferece compressão ~20% melhor que gzip para assets web.`,
  },
  {
    title: "5. Auto Minify (JS, CSS, HTML)",
    content: `Speed → Optimization → Content Optimization → Auto Minify:\n• JavaScript: ON\n• CSS: ON\n• HTML: ON\n\nNota: O Vite já minifica no build, mas o Cloudflare pode otimizar ainda mais o HTML servido pelo nginx.`,
  },
  {
    title: "6. Ativar HTTP/3 (QUIC)",
    content: `Network → HTTP/3 (with QUIC): ON.\nHTTP/3 melhora significativamente a velocidade em conexões mobile e redes instáveis.`,
  },
  {
    title: "7. Ativar Early Hints (103)",
    content: `Speed → Optimization → Content Optimization → Early Hints: ON.\nIsso permite que o navegador comece a carregar assets críticos antes mesmo de receber o HTML completo.`,
  },
  {
    title: "8. Page Rules para Admin/Preview",
    content: `IMPORTANTE: Crie regras para NUNCA cachear o admin e preview:\n\n• Regra 1: agisdigital.com/admin* → Cache Level: Bypass\n• Regra 2: agisdigital.com/*preview=draft* → Cache Level: Bypass\n\nIsso garante que o painel admin e o modo prévia sempre mostrem dados atualizados.`,
  },
];

const CACHE_STRATEGIES = [
  { value: "normal", label: "Normal (2h edge, 4h browser)", desc: "Bom equilíbrio entre performance e atualização" },
  { value: "aggressive", label: "Agressivo (1d edge, 1d browser)", desc: "Máxima performance, ideal para páginas estáveis" },
  { value: "conservative", label: "Conservador (1h edge, 2h browser)", desc: "Atualizações mais frequentes, menos cache" },
];

const CACHE_RULES_SNIPPET = `# Page Rules do Cloudflare (ordem de prioridade)

# 1. NUNCA cachear admin
URL: seudominio.com/admin*
Setting: Cache Level → Bypass

# 2. NUNCA cachear preview/draft
URL: seudominio.com/*preview=draft*
Setting: Cache Level → Bypass

# 3. Cachear página pública
URL: seudominio.com/*
Setting: Cache Level → Cache Everything
         Edge Cache TTL → 2 hours`;

export const AdminPerformance = () => {
  const { toast } = useToast();
  const [strategy, setStrategy] = useState("normal");

  const handlePurgeCache = () => {
    toast({
      title: "Instrução de limpeza de cache",
      description: "Acesse Cloudflare → Caching → Configuration → Purge Everything. Ou use a API: POST /zones/{zone_id}/purge_cache com {\"purge_everything\":true}",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Texto copiado para a área de transferência." });
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Status de Performance
          </CardTitle>
          <CardDescription>Visão geral das otimizações ativas no projeto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">Lazy Load</p>
                <p className="text-xs text-muted-foreground">Seções abaixo da dobra carregam sob demanda</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">Code Splitting</p>
                <p className="text-xs text-muted-foreground">Admin separado do bundle público</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">Tracking Deferred</p>
                <p className="text-xs text-muted-foreground">Scripts de tracking carregam após o LCP</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">Cache de Dados</p>
                <p className="text-xs text-muted-foreground">Conteúdo publicado com staleTime de 60s</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">CDN / Cloudflare</p>
              <p className="text-xs text-muted-foreground">Configure o Cloudflare seguindo o guia abaixo para ativar cache de borda, Brotli e HTTP/3.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cloudflare Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Guia Cloudflare
          </CardTitle>
          <CardDescription>Passo a passo para configurar CDN, cache e otimizações</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {CLOUDFLARE_STEPS.map((step, i) => (
              <AccordionItem key={i} value={`step-${i}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  {step.title}
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed font-sans">
                    {step.content}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir Cloudflare
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cache Config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Configuração de Cache
          </CardTitle>
          <CardDescription>Estratégia de cache recomendada para o Cloudflare</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Estratégia recomendada</label>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CACHE_STRATEGIES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    <div>
                      <span className="font-medium">{s.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">— {s.desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Page Rules (copie para o Cloudflare)
              </p>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(CACHE_RULES_SNIPPET)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {CACHE_RULES_SNIPPET}
            </pre>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <Shield className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Rotas protegidas — NUNCA cachear</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• <code>/admin</code> e <code>/admin/*</code></li>
                <li>• <code>?preview=draft</code></li>
                <li>• Requisições ao Supabase (são API, não passam pelo cache de página)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purge Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-primary" />
            Limpar Cache
          </CardTitle>
          <CardDescription>Limpe o cache do Cloudflare após publicar alterações importantes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Após publicar alterações visuais ou de conteúdo, limpe o cache para que os visitantes vejam a versão atualizada imediatamente.
          </p>

          <Button onClick={handlePurgeCache} variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Instruções para limpar cache
          </Button>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Via Cloudflare API (futuro):</p>
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">{`curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache" \\
  -H "Authorization: Bearer {API_TOKEN}" \\
  -H "Content-Type: application/json" \\
  --data '{"purge_everything":true}'`}</pre>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache" -H "Authorization: Bearer {API_TOKEN}" -H "Content-Type: application/json" --data '{"purge_everything":true}'`)}>
              <Copy className="mr-2 h-4 w-4" /> Copiar comando
            </Button>
          </div>

          <div className="flex items-start gap-3 rounded-lg border p-4">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong>Nota:</strong> Conteúdo do Supabase (textos, CTAs, configurações) não é afetado pelo cache do Cloudflare — ele é carregado diretamente via API. O cache do Cloudflare afeta apenas os assets estáticos (HTML, JS, CSS, imagens).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
