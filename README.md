# Agis Digital — Landing Page

Landing page de alta conversão para emissão de Certificados Digitais, com painel administrativo completo, personalização por UTM, testes A/B/C e governança de conteúdo.

## Stack

- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Deploy:** Docker + Nginx (runtime config, sem rebuild para trocar Supabase)

## Estrutura do Projeto

```
src/
├── pages/           # Index (landing), Admin, AdminLogin, NotFound
├── components/
│   ├── landing/     # Seções da landing page (Hero, Pricing, FAQ, etc.)
│   ├── admin/       # Abas do painel administrativo (20 abas)
│   └── ui/          # Componentes shadcn/ui
├── hooks/           # useCtaMessages, useExperiment, useUtmPersonalization, etc.
├── lib/             # auditLog, logAccess, checkIsAdmin, runtimeConfig
└── integrations/    # Cliente Supabase

deploy/
├── Dockerfile           # Build multi-stage (Node → Nginx)
├── docker-compose.yml   # Deploy standalone
├── docker-stack.yml     # Deploy Swarm / Portainer
├── docker-entrypoint.sh # Injeção de runtime-config.js
├── nginx.conf           # Configuração SPA
├── migration-master.sql # SQL completo para banco novo
├── upgrade-add-environment.sql
├── upgrade-add-experiments.sql
├── upgrade-add-utm-rules.sql
├── upgrade-add-geo-settings.sql
├── upgrade-add-exit-intent-settings.sql
├── upgrade-add-system-errors.sql
└── upgrade-add-anti-spam.sql
```

## Desenvolvimento Local

```bash
npm install
npm run dev
```

## Deploy em Produção

Consulte **[deploy/README.md](deploy/README.md)** para o guia completo de:

- Build e push da imagem Docker
- Deploy em Docker Compose, Swarm ou Portainer
- Configuração de banco (instalação nova e upgrade)
- Checklist de produção e smoke test
- Configuração de domínio e HTTPS
- Troubleshooting

## Funcionalidades

| Recurso | Descrição |
|---------|-----------|
| **Landing page dinâmica** | Conteúdo 100% gerenciável pelo admin |
| **Draft / Publish** | Rascunho separado do conteúdo público |
| **Previsualização** | Preview do rascunho com `?preview=draft` (admin-only) |
| **Histórico** | Log de todas as alterações com quem/quando/o quê |
| **Versionamento** | Snapshots restauráveis do conteúdo publicado |
| **Experimentos A/B/C** | Testes de variantes com tracking por sessão |
| **Personalização UTM** | Conteúdo personalizado por campanha |
| **Tracking / Inteligência** | Dashboard de CTAs, dispositivos, cidades, conversão |
| **Geolocalização** | Multi-provedor (ipapi, ip-api, Cloudflare) com fallback automático contra 429 |
| **WhatsApp dinâmico** | Número e mensagens configuráveis por CTA |
| **SEO / Open Graph** | Meta tags gerenciáveis pelo admin |
| **Multi-tenant** | Uma imagem Docker serve vários clientes (runtime config) |
| **Diagnóstico de Erros** | Central de monitoramento de falhas de frontend e integrações |

## Segurança

- RLS em todas as tabelas (14 tabelas)
- RBAC via `has_role()` (SECURITY DEFINER)
- Bootstrap seguro do primeiro admin via RPC com chave
- Input validation com Zod
- Anon só lê dados públicos/publicados/ativos
- Admin protegido por Supabase Auth + role check

## Geolocalização

O sistema detecta a cidade do visitante para personalização de textos (Dynamic Text Replacement). Configurável pelo admin em **Integrações → Geolocalização**.

### Provedores suportados

| Provedor | Endpoint | Observações |
|----------|----------|-------------|
| `ipapi` (padrão) | `ipapi.co/json/` | Suporta chave PRO para evitar limite 429 |
| `ip-api` | `ip-api.com/json/` | Gratuito, sem chave |
| `cloudflare` | `/api/geo` (Nginx) | Requer Cloudflare como proxy (usa headers CF) |

### Configuração

1. No admin, aba **Integrações**, seção **Geolocalização**
2. Escolha o provedor, insira a chave PRO (se aplicável)
3. Ative **Fallback multi-provedor** para redundância automática
4. Publique as alterações

### Fallback

Com fallback ativo, se o provedor principal retornar erro 429 ou falhar, o sistema tenta automaticamente os outros provedores na ordem: `ipapi → ip-api → cloudflare`. Se todos falharem, exibe "sua região" como texto seguro.

### Upgrade de banco existente

```bash
psql -f deploy/upgrade-add-geo-settings.sql
```

## Popup de Retenção (Exit Intent)

Popup de retenção com desconto que aparece quando o visitante tenta sair da página. Configurável pelo admin em **Integrações → Popup de Retenção**.

### Gatilhos disponíveis

| Gatilho | Dispositivo | Comportamento |
|---------|-------------|---------------|
| Mouse Leave | Desktop | Dispara quando o mouse sai pelo topo da janela |
| Scroll Rápido | Mobile | Detecta subidas rápidas (>150px em <200ms) |
| Botão Voltar | Mobile | Intercepta o botão voltar do navegador |
| Inatividade | Ambos | Dispara após 20s sem interação |

O popup é exibido **uma vez por sessão** (controlado via `sessionStorage`).

### Upgrade de banco existente

```bash
psql -f deploy/upgrade-add-exit-intent-settings.sql
```

## Monitoramento e Diagnóstico

O sistema possui uma Central de Diagnóstico (`system_errors`) que captura automaticamente falhas de frontend e integrações.

### Como funciona

| Origem | O que captura |
|--------|---------------|
| `ErrorBoundary` | Erros de renderização e falhas de chunk/lazy loading |
| `useGeolocation` | Falha total de todos os provedores de geolocalização |
| `WhatsAppButton` | Falha ao disparar eventos de conversão (dataLayer) |

Os erros são registrados na tabela `system_errors` e podem ser visualizados na aba **20. Diagnóstico** do painel admin, com filtros para pendentes/resolvidos.

### Limpeza da tabela

Para limpar erros antigos resolvidos:

```sql
DELETE FROM public.system_errors WHERE resolved = true AND created_at < now() - interval '30 days';
```

### Upgrade de banco existente

```bash
psql -f deploy/upgrade-add-system-errors.sql
```

## Proteção Anti-Spam Frontend

O sistema possui rate limiting no frontend via `localStorage` para proteger o Supabase contra loops e excesso de requisições.

### Como funciona

O utilitário `checkRateLimit(action)` contabiliza ações de escrita (log de acesso, eventos de experimento, eventos UTM) e bloqueia silenciosamente quando o limite é atingido dentro da janela de tempo.

| Configuração | Default | Descrição |
|---|---|---|
| `spam_guard_enabled` | `true` | Liga/desliga o rate limiting |
| `spam_max_requests` | `20` | Máximo de ações por janela |
| `spam_window_ms` | `60000` | Janela em milissegundos (1 min) |

Configurável pelo admin em **Integrações → Proteção Anti-Spam**.

### Upgrade de banco existente

```bash
psql -f deploy/upgrade-add-anti-spam.sql
```
