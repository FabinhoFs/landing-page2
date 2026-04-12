# 🚀 Deploy — Agis Digital LP

Guia completo para deploy em produção com Docker.

---

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configurar variáveis de ambiente](#2-configurar-variáveis-de-ambiente)
3. [Banco de dados](#3-banco-de-dados)
4. [Build da imagem Docker](#4-build-da-imagem-docker)
5. [Push para Docker Hub / Registry](#5-push-para-docker-hub--registry)
6. [Deploy com Docker Compose](#6-deploy-com-docker-compose)
7. [Deploy com Docker Swarm / Portainer](#7-deploy-com-docker-swarm--portainer)
8. [Verificações pós-deploy](#8-verificações-pós-deploy)
9. [Smoke test final](#9-smoke-test-final)
10. [Domínio e HTTPS](#10-domínio-e-https)
11. [Configurar Supabase para produção](#11-configurar-supabase-para-produção)
12. [Governança (Draft/Publish, Histórico, Versões)](#12-governança)
13. [Experimentos A/B/C](#13-experimentos-abc)
14. [Personalização por UTM](#14-personalização-por-utm)
15. [Atualização e rollback](#15-atualização-e-rollback)
16. [Checklist final de produção](#16-checklist-final-de-produção)
17. [Comandos rápidos](#17-comandos-rápidos)
18. [Troubleshooting](#18-troubleshooting)

---

## Pré-requisitos

- VPS com Ubuntu 22+ ou Debian 12+
- Docker Engine 24+ e Docker Compose v2+

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Saia e entre novamente no terminal
```

---

## 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
nano .env
```

| Variável | Descrição | Onde encontrar |
|----------|-----------|----------------|
| `SUPABASE_URL` | URL do projeto Supabase | Dashboard → Settings → API |
| `SUPABASE_PUBLISHABLE_KEY` | Chave anon/pública | Dashboard → Settings → API |
| `APP_PORT` | Porta local (padrão: 3000) | Sua preferência |

> ⚠️ **NUNCA** coloque a `service_role` key no `.env`. Ela dá acesso total ao banco.

### Arquitetura de Runtime Config

A imagem Docker é **genérica** — não contém credenciais. A configuração é injetada em runtime:

1. Container inicia → executa `docker-entrypoint.sh`
2. Script gera `/usr/share/nginx/html/runtime-config.js` com as variáveis
3. `index.html` carrega `runtime-config.js` antes do bundle React
4. App lê `window.RUNTIME_CONFIG` em vez de `import.meta.env`

**Benefício:** Uma única imagem serve para vários clientes — mude apenas as variáveis, sem rebuild.

---

## 3. Banco de Dados

### 3.1 Banco Novo (primeira instalação)

**Pré-requisito:** Crie a função `has_role()` e a tabela `user_roles` primeiro:

```sql
-- 1. Criar enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Criar tabela user_roles
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Criar função has_role (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Criar RPC admin_exists
CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;

-- 5. Criar RPC bootstrap_first_admin (configure BOOTSTRAP_KEY)
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(_bootstrap_key text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'Administrador já existe';
  END IF;
  IF _bootstrap_key != 'SUA_CHAVE_SECRETA_AQUI' THEN
    RAISE EXCEPTION 'Chave de bootstrap inválida';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
END;
$$;
```

Depois execute `deploy/migration-master.sql` no SQL Editor do Supabase.

### 3.2 Upgrade de Banco Existente

Execute os scripts de upgrade **na ordem**, conforme necessário:

| Script | Quando usar |
|--------|-------------|
| `deploy/upgrade-add-environment.sql` | Banco sem coluna `environment` em `site_settings` |
| `deploy/upgrade-add-experiments.sql` | Banco sem tabelas de experimentos A/B/C |
| `deploy/upgrade-add-utm-rules.sql` | Banco sem tabelas de personalização UTM |

> Cada script é idempotente — pode ser executado mais de uma vez sem erro.

### 3.3 Validação pós-banco

```sql
-- Verificar que todas as tabelas existem
SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  AND tablename IN ('site_settings', 'testimonials', 'certificate_prices',
    'certificate_features', 'faqs', 'access_logs', 'admin_audit_log',
    'page_versions', 'experiments', 'experiment_variants',
    'experiment_events', 'utm_rules', 'utm_events', 'user_roles');

-- Verificar RLS ativo em todas
SELECT tablename, rowsecurity FROM pg_tables
  WHERE schemaname = 'public' AND rowsecurity = true;

-- Verificar que site_settings tem draft e published
SELECT environment, COUNT(*) FROM site_settings GROUP BY environment;

-- Verificar função has_role existe
SELECT proname FROM pg_proc WHERE proname = 'has_role';
```

---

## 4. Build da Imagem Docker

### Build padrão

```bash
cd /caminho/do/projeto
docker build -f deploy/Dockerfile -t agis-lp:latest .
```

### Build sem cache (garantir imagem limpa)

```bash
docker build -f deploy/Dockerfile -t agis-lp:latest --no-cache .
```

### Build com tag de versão

```bash
docker build -f deploy/Dockerfile -t agis-lp:1.0.0 -t agis-lp:latest .
```

---

## 5. Push para Docker Hub / Registry

### Docker Hub

```bash
# 1. Login
docker login

# 2. Tag com seu usuário/organização
docker tag agis-lp:latest seuusuario/agis-lp:latest
docker tag agis-lp:latest seuusuario/agis-lp:1.0.0

# 3. Push
docker push seuusuario/agis-lp:latest
docker push seuusuario/agis-lp:1.0.0
```

### Registry privado

```bash
docker tag agis-lp:latest registry.seudominio.com/agis-lp:latest
docker push registry.seudominio.com/agis-lp:latest
```

### Atualizar imagem após mudança no código

```bash
cd /caminho/do/projeto
git pull origin main
docker build -f deploy/Dockerfile -t agis-lp:latest --no-cache .
docker tag agis-lp:latest seuusuario/agis-lp:latest
docker push seuusuario/agis-lp:latest
```

---

## 6. Deploy com Docker Compose

### Subir

```bash
cd deploy
docker compose build
docker compose up -d
```

### Verificar

```bash
docker compose ps
docker compose logs --tail=20
curl -I http://localhost:3000
```

### Trocar Supabase sem rebuild

```bash
# Edite .env com as novas credenciais
nano .env
docker compose restart
```

---

## 7. Deploy com Docker Swarm / Portainer

### 7.1 Via CLI (Docker Stack)

```bash
# Se a imagem está no Docker Hub:
SUPABASE_URL="https://xxx.supabase.co" \
SUPABASE_PUBLISHABLE_KEY="eyJ..." \
docker stack deploy -c deploy/docker-stack.yml agis
```

### 7.2 Via Portainer

1. Acesse **Stacks → Add stack**
2. Cole o conteúdo de `deploy/docker-stack.yml` ou faça upload
3. Em **Environment variables**, defina:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `APP_PORT` (padrão: `3000`)
4. Clique em **Deploy the stack**

### 7.3 Atualizar stack com nova imagem

**Via CLI:**
```bash
# Rebuildar e pushar
docker build -f deploy/Dockerfile -t seuusuario/agis-lp:latest --no-cache .
docker push seuusuario/agis-lp:latest

# Atualizar o serviço
docker service update --image seuusuario/agis-lp:latest agis_agis-lp --force
```

**Via Portainer:**
1. Stacks → agis → **Update the stack**
2. Marque **Re-pull image**
3. Clique **Update**

### 7.4 Trocar Supabase sem rebuild

**Via Portainer:** Stacks → agis → Environment → editar variáveis → Update

**Via CLI:**
```bash
SUPABASE_URL="https://novo.supabase.co" \
SUPABASE_PUBLISHABLE_KEY="eyJ_nova..." \
docker stack deploy -c deploy/docker-stack.yml agis
```

### 7.5 Rollback

```bash
docker service rollback agis_agis-lp
```

Ou via Portainer: Services → agis_agis-lp → Rollback.

### 7.6 Multi-tenant

```
┌─────────────────────────────────────────────────┐
│               agis-lp:latest                    │
│          (imagem Docker genérica)                │
└──────────┬──────────────┬───────────────┬───────┘
           │              │               │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌──────▼──────┐
    │ Stack: A    │ │ Stack: B   │ │ Stack: C    │
    │ SUPABASE_URL│ │ SUPABASE_  │ │ SUPABASE_   │
    │ =cliente-a  │ │ URL=cli-b  │ │ URL=cli-c   │
    │ PORT=3001   │ │ PORT=3002  │ │ PORT=3003   │
    └─────────────┘ └────────────┘ └─────────────┘
```

### Compose vs Swarm

| Aspecto | `docker-compose.yml` | `docker-stack.yml` |
|---------|---------------------|--------------------|
| Modo | `docker compose up -d` | `docker stack deploy` |
| Build | Suporta `build:` inline | Requer imagem pré-construída |
| Restart | `restart: unless-stopped` | `deploy.restart_policy` |
| Update | Rebuild + recreate | Rolling update com rollback |
| Rede | `bridge` | `overlay` |

---

## 8. Verificações Pós-Deploy

### Verificar serviço (Swarm)

```bash
# Listar serviços
docker service ls

# Ver réplicas e status
docker service ps agis_agis-lp

# Logs do serviço
docker service logs agis_agis-lp --tail 50

# Logs em tempo real
docker service logs agis_agis-lp -f
```

### Verificar container (Compose)

```bash
docker compose ps
docker compose logs --tail 50
```

### Verificar HTTP

```bash
# Deve retornar 200
curl -I http://localhost:3000

# Verificar que runtime-config.js foi gerado
curl -s http://localhost:3000/runtime-config.js | head -5

# Verificar que a página carrega
curl -s http://localhost:3000 | grep -o "<title>.*</title>"
```

### Verificar healthcheck

```bash
# Compose
docker compose ps --format "table {{.Name}}\t{{.Status}}"

# Swarm — inspecionar saúde do container
docker inspect --format='{{json .State.Health}}' $(docker ps -q -f name=agis)
```

---

## 9. Smoke Test Final

Após deploy, execute este checklist para validar que tudo funciona:

### 9.1 Landing Page Pública

- [ ] Acessar `https://seudominio.com.br` — página carrega sem erro
- [ ] Hero exibe título, subtítulo e CTAs
- [ ] Seções carregam: preços, diferenciais, depoimentos, FAQ
- [ ] Botões de WhatsApp abrem `wa.me` com número correto
- [ ] Botão flutuante do WhatsApp aparece
- [ ] Mobile: CTA fixo no rodapé funciona
- [ ] SEO: título e meta description corretos (`<title>`, `<meta name="description">`)
- [ ] Favicon carrega corretamente
- [ ] Open Graph: `<meta property="og:title">` e `og:image` presentes

### 9.2 Admin

- [ ] Acessar `/admin/login` — tela de login aparece
- [ ] Login com credenciais de admin funciona
- [ ] Painel admin carrega com todas as 20 abas
- [ ] Editar um campo → salvar → mensagem "Salvo com sucesso"

### 9.3 Draft / Publish

- [ ] Salvar rascunho → barra mostra "X alterações não publicadas"
- [ ] Clicar **Previsualizar** → nova aba com rascunho + badge "PRÉVIA DO RASCUNHO"
- [ ] Clicar **Publicar** → página pública atualiza
- [ ] Publicar de novo (segunda vez seguida) → sem erro
- [ ] Descartar rascunho → conteúdo volta ao publicado

### 9.4 Governança

- [ ] Aba Versões: salvar versão funciona
- [ ] Aba Versões: restaurar versão funciona (vai para rascunho)
- [ ] Aba Histórico: alterações aparecem com data/hora/usuário

### 9.5 Inteligência / Tracking

- [ ] Aba Inteligência: dashboard carrega com gráficos
- [ ] Clicar em CTA na landing page → registro aparece em access_logs
- [ ] UTMs na URL (`?utm_source=teste`) → registrado no tracking

### 9.6 Infraestrutura

- [ ] `docker service ls` ou `docker compose ps` — serviço healthy
- [ ] Logs sem erros críticos
- [ ] `curl -I https://seudominio.com.br` → 200 OK
- [ ] HTTPS ativo com certificado válido

---

## 10. Domínio e HTTPS

### Opção A: Nginx Reverse Proxy + Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Crie `/etc/nginx/sites-available/agis`:

```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/agis /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

### Opção B: Nginx Proxy Manager

1. Aponte o domínio para o IP da VPS
2. No NPM, crie Proxy Host → `http://IP_INTERNO:3000`
3. Ative SSL via Let's Encrypt

### Opção C: Traefik (Swarm)

No `docker-stack.yml`:
1. Remova a seção `ports`
2. Descomente as labels do Traefik e a rede `traefik-public`
3. Substitua `seudominio.com.br` pelo seu domínio
4. Deploy: `docker stack deploy -c deploy/docker-stack.yml agis`

---

## 11. Configurar Supabase para Produção

No [Dashboard do Supabase](https://supabase.com/dashboard):

| Configuração | Caminho | Valor |
|-------------|---------|-------|
| Site URL | Auth → URL Configuration | `https://seudominio.com.br` |
| Redirect URLs | Auth → URL Configuration | `https://seudominio.com.br/**` |
| Leaked Password Protection | Auth → Attack Protection | Ativar |
| Rate Limiting | Auth → Rate Limits | 5 tentativas/minuto |

---

## 12. Governança

### 12.1 Draft / Publish

A tabela `site_settings` usa coluna `environment` (`'draft'` ou `'published'`):

| Ambiente | Quem lê | Quem escreve |
|----------|---------|--------------|
| `draft` | Admin (edição) | Admin (salvar) |
| `published` | Landing page pública | Admin (publicar) |

**Fluxo:**
1. Admin edita → salva no **rascunho**
2. Admin clica **Previsualizar** → `/?preview=draft` em nova aba (admin-only)
3. Admin valida → clica **Publicar** → rascunho copiado para publicado
4. Admin pode **Descartar Rascunho** → rascunho volta ao estado publicado

**Segurança:** Visitantes anônimos só leem `published`. Preview requer autenticação.

### 12.2 Histórico e Versionamento

| Tabela | Finalidade |
|--------|-----------|
| `admin_audit_log` | Log de todas as alterações (quem, quando, o quê) |
| `page_versions` | Snapshots restauráveis do conteúdo publicado |

| Recurso | Aba Admin | Descrição |
|---------|-----------|-----------|
| Histórico | 20. Histórico | Log completo com filtro e limpeza |
| Versões | 19. Versões | Salvar, restaurar, limpar snapshots |
| Publicação | Topo do admin | Barra com status, Publicar, Descartar, Previsualizar |

**Retenção recomendada:** Limpar histórico > 90 dias. Manter máx. 10 versões.

---

## 13. Experimentos A/B/C

| Tabela | Finalidade |
|--------|-----------|
| `experiments` | Cadastro (nome, seção, status, distribuição) |
| `experiment_variants` | Variantes com config JSON |
| `experiment_events` | Impressões e cliques por variante |

**Fluxo:** Criar → Definir variantes → Ativar → Acompanhar CTR → Encerrar → Aplicar vencedor

**Seções suportadas:** Hero, CTA Hero, CTA Header, CTA Ofertas

**Segurança:** Anon só vê ativos. Criar/editar exige admin.

---

## 14. Personalização por UTM

| Tabela | Finalidade |
|--------|-----------|
| `utm_rules` | Regras (critérios UTM, campos sobrescritos, prioridade) |
| `utm_events` | Tracking de impressões e cliques por regra |

**Campos personalizáveis:** `hero_badge`, `hero_headline_line1/2`, `hero_subheadline`, `hero_cta_primary/secondary`, `cta_hero_message`, `hero_dynamic_line/fallback_line`, `pricing_highlight`

**Prioridade:** Maior `priority` → mais específica → primeira encontrada

**Precedência geral:** UTM > Experimento A/B/C > Conteúdo publicado

**Fallback:** Sem UTM ou sem match → conteúdo publicado padrão.

---

## 15. Atualização e Rollback

### Atualizar (código novo)

```bash
cd /caminho/do/projeto
git pull origin main
docker build -f deploy/Dockerfile -t agis-lp:latest --no-cache .

# Compose
cd deploy && docker compose up -d

# Swarm
docker tag agis-lp:latest seuusuario/agis-lp:latest
docker push seuusuario/agis-lp:latest
docker service update --image seuusuario/agis-lp:latest agis_agis-lp --force
```

### Rollback rápido (Swarm)

```bash
docker service rollback agis_agis-lp
```

### Rollback por commit

```bash
git log --oneline -5
git checkout <COMMIT_HASH>
docker build -f deploy/Dockerfile -t agis-lp:latest --no-cache .
# Deploy normalmente
```

---

## 16. Checklist Final de Produção

### Banco / Migrations

- [ ] `migration-master.sql` executado (banco novo) OU scripts de upgrade executados
- [ ] Função `has_role()` e tabela `user_roles` existem
- [ ] Todas as 14 tabelas criadas com RLS ativo
- [ ] `site_settings` tem dados em `draft` e `published`
- [ ] RPC `admin_exists` e `bootstrap_first_admin` criadas
- [ ] Bootstrap do primeiro admin concluído

### Admin

- [ ] Login em `/admin/login` funciona
- [ ] 20 abas carregam corretamente
- [ ] Salvar rascunho funciona
- [ ] Publicar funciona (inclusive múltiplas vezes seguidas)
- [ ] Previsualizar abre draft em nova aba
- [ ] Descartar rascunho funciona
- [ ] Histórico registra alterações
- [ ] Versionamento (salvar/restaurar) funciona

### Landing Page

- [ ] Página pública carrega com conteúdo publicado
- [ ] Hero, preços, diferenciais, depoimentos, FAQ exibem corretamente
- [ ] CTAs do WhatsApp funcionam (número correto)
- [ ] Geolocalização detecta cidade
- [ ] Favicon e logo corretos
- [ ] SEO: title, description, og:image configurados

### Tracking / Inteligência

- [ ] Cliques em CTAs registrados em `access_logs`
- [ ] Dashboard de inteligência carrega
- [ ] UTMs capturadas e exibidas no tracking
- [ ] Experimentos (se ativos) distribuem variantes

### Infra / Deploy

- [ ] `.env` configurado com `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`
- [ ] Container healthy (healthcheck passando)
- [ ] Logs mostram `runtime-config.js generated successfully`
- [ ] `curl -I https://seudominio.com.br` → 200 OK
- [ ] HTTPS ativo com certificado válido
- [ ] Site URL configurada no Supabase Dashboard
- [ ] Redirect URLs configuradas
- [ ] Leaked Password Protection ativada

---

## 17. Comandos Rápidos

| Ação | Compose | Swarm |
|------|---------|-------|
| Subir | `docker compose up -d` | `docker stack deploy -c docker-stack.yml agis` |
| Parar | `docker compose down` | `docker stack rm agis` |
| Status | `docker compose ps` | `docker service ls` |
| Logs | `docker compose logs -f` | `docker service logs agis_agis-lp -f` |
| Rebuild | `docker compose build --no-cache` | `docker build -f deploy/Dockerfile -t agis-lp:latest --no-cache .` |
| Atualizar | `docker compose up -d` | `docker service update --image agis-lp:latest agis_agis-lp --force` |
| Rollback | `git checkout <hash>` + rebuild | `docker service rollback agis_agis-lp` |
| Trocar Supabase | Editar `.env` → `docker compose restart` | Editar variáveis na stack → Update |

---

## 18. Troubleshooting

### `runtime-config.js` não gerado

Verifique que `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` estão definidas:
```bash
docker exec <container> cat /usr/share/nginx/html/runtime-config.js
```

### `Could not find 'environment' column`

Execute `deploy/upgrade-add-environment.sql` no SQL Editor do Supabase.

### `ON CONFLICT DO UPDATE cannot affect row a second time`

Isso foi corrigido na versão atual. Atualize o código e faça rebuild.

### Healthcheck falhando

```bash
# Verificar manualmente
docker exec <container> wget -qO- http://127.0.0.1:80/

# Desativar temporariamente (substituir no docker-stack.yml)
healthcheck:
  test: ["NONE"]
```

### Container reiniciando em loop

```bash
docker service logs agis_agis-lp --tail 100
# Verificar se as variáveis de ambiente estão corretas
```
