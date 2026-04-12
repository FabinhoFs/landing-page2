# 🚀 Deploy — Agis Digital LP

Guia completo para deploy em VPS Ubuntu/Debian com Docker.

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

## 1. Clonar o Repositório

```bash
git clone https://github.com/SEU_USUARIO/agis-digital-lp.git
cd agis-digital-lp
```

---

## 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
nano .env
```

| Variável | Tipo | Descrição | Onde encontrar |
|----------|------|-----------|----------------|
| `SUPABASE_URL` | **Runtime** | URL do projeto Supabase | Dashboard → Settings → API |
| `SUPABASE_PUBLISHABLE_KEY` | **Runtime** | Chave anon/pública | Dashboard → Settings → API |
| `APP_PORT` | **Runtime** | Porta local (padrão: 3000) | Sua preferência |

> ⚠️ **NUNCA** coloque a `service_role` key no `.env`. Ela dá acesso total ao banco.

### Arquitetura de Runtime Config

A imagem Docker é **genérica** — não contém credenciais Supabase. A configuração é injetada em runtime:

1. O container inicia e executa `docker-entrypoint.sh`
2. O script gera `/usr/share/nginx/html/runtime-config.js` a partir das variáveis de ambiente
3. O `index.html` carrega `runtime-config.js` antes do bundle da aplicação
4. O app React lê `window.RUNTIME_CONFIG` em vez de `import.meta.env`

**Benefícios:**
- Uma única imagem serve para **vários clientes** — mude apenas as variáveis
- Trocar de servidor Supabase **não requer rebuild**
- Secrets não ficam embutidas no bundle JavaScript

---

## 3. Build e Subir em Produção

```bash
cd deploy
docker compose build
docker compose up -d
```

A aplicação estará acessível na porta definida em `APP_PORT`. Exemplo com `APP_PORT=3000`:

```
http://SEU_IP:3000
```

---

## 4. Healthcheck

O healthcheck **não está embutido na imagem Docker**. Ele é definido exclusivamente nos arquivos de deploy (`docker-compose.yml` e `docker-stack.yml`), permitindo ajuste por ambiente sem rebuild.

### 4.1 Comportamento padrão

```yaml
healthcheck:
  test: ["CMD", "wget", "-qO-", "http://127.0.0.1:80/"]
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 20s
```

### 4.2 Verificar status

```bash
# Compose
docker compose ps --format "table {{.Name}}\t{{.Status}}"

# Swarm
docker service ps agis_agis-lp
docker inspect --format='{{json .State.Health}}' <CONTAINER_ID>
```

### 4.3 Desativar temporariamente (diagnóstico)

Para impedir que o Swarm reinicie o container durante debug, substitua o bloco de healthcheck na stack por:

```yaml
healthcheck:
  test: ["NONE"]
```

**No Portainer:** Stacks → agis → Editor → substitua o bloco → **Update the stack**.

**Via CLI (Compose):**
```bash
# Edite deploy/docker-compose.yml com a alteração acima, depois:
docker compose up -d
```

### 4.4 Reativar

Restaure o bloco original do healthcheck e faça update da stack:

**No Portainer:** Stacks → agis → Editor → restaure o bloco → **Update the stack**.

**Via CLI:**
```bash
docker compose up -d
# ou para Swarm:
docker stack deploy -c deploy/docker-stack.yml agis
```

### 4.5 Ajustar por ambiente

Você pode alterar `interval`, `timeout`, `retries` e `start_period` diretamente na stack do Portainer sem rebuild da imagem. Exemplos:

| Ambiente | `interval` | `start_period` | `retries` |
|----------|-----------|----------------|-----------|
| Produção | `30s` | `20s` | `3` |
| Staging | `60s` | `30s` | `5` |
| Debug | desativado (`test: ["NONE"]`) | — | — |

---

## 5. Ver Logs

```bash
# Tempo real
docker compose logs -f

# Últimas 100 linhas
docker compose logs --tail=100
```

---

## 6. Atualizar a Aplicação

```bash
cd agis-digital-lp
git pull origin main
cd deploy
docker compose build --no-cache
docker compose up -d
```

> **Nota:** Rebuild é necessário apenas para mudanças no código. Para trocar a URL/chave do Supabase, basta atualizar o `.env` e reiniciar: `docker compose restart`

---

## 7. Rollback Simples

Se a nova versão apresentar problemas:

### 7.1 Identificar o commit anterior

```bash
cd agis-digital-lp
git log --oneline -5
```

### 7.2 Voltar para o commit desejado

```bash
git checkout e4f5g6h
```

### 7.3 Rebuildar e subir

```bash
cd deploy
docker compose build --no-cache
docker compose up -d
```

### 7.4 Retornar para a branch principal

```bash
git checkout main
git pull origin main
cd deploy
docker compose build --no-cache
docker compose up -d
```

---

## 8. Configurar Domínio + HTTPS

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
2. No NPM, crie um Proxy Host apontando para `http://IP_INTERNO:3000`
3. Ative SSL via Let's Encrypt no NPM

### Opção C: Traefik (Docker Swarm)

Edite o `deploy/docker-stack.yml`:
1. Remova a seção `ports`
2. Descomente as labels do Traefik e a rede `traefik-public`
3. Substitua `seudominio.com.br` pelo seu domínio
4. Suba com `docker stack deploy -c deploy/docker-stack.yml agis`

---

## 9. Configurar Supabase para Produção

Acesse o [Dashboard do Supabase](https://supabase.com/dashboard):

### 9.1 URL do Site
- **Authentication → URL Configuration → Site URL**
- Defina: `https://seudominio.com.br`

### 9.2 Redirect URLs
- **Authentication → URL Configuration → Redirect URLs**
- Adicione: `https://seudominio.com.br/**`

### 9.3 Leaked Password Protection
- **Authentication → Attack Protection → Enable Leaked Password Protection**
- Ative para impedir uso de senhas conhecidamente vazadas

### 9.4 Rate Limiting
- **Authentication → Rate Limits**
- Configure limites adequados (ex: 5 tentativas/minuto)

### 9.5 Autenticação — Observações de Produção

O painel `/admin` usa Supabase Auth com email/senha e `localStorage` para persistência de sessão.

**Configurações obrigatórias:**
- O domínio final **deve** ser cadastrado como Site URL e Redirect URL no Supabase
- Sessões são renovadas automaticamente via `autoRefreshToken: true`
- Use **HTTPS obrigatoriamente** — cookies e tokens trafegam pela rede

---

## 10. Deploy via Docker Swarm / Portainer

O projeto inclui `deploy/docker-stack.yml` otimizado para Swarm.

### 10.1 Build da Imagem (uma única vez)

Docker Swarm **não suporta `build` inline**. Construa a imagem:

```bash
docker build -f deploy/Dockerfile -t agis-lp:latest .
```

> **A imagem é genérica** — não contém credenciais. A mesma imagem serve para todos os clientes.

Em clusters multi-node, publique num registry:

```bash
docker tag agis-lp:latest registry.exemplo.com/agis-lp:latest
docker push registry.exemplo.com/agis-lp:latest
```

### 10.2 Deploy via CLI

```bash
SUPABASE_URL="https://xxx.supabase.co" \
SUPABASE_PUBLISHABLE_KEY="eyJ..." \
docker stack deploy -c deploy/docker-stack.yml agis
```

### 10.3 Deploy via Portainer

1. Acesse **Stacks → Add stack**
2. Cole o conteúdo de `deploy/docker-stack.yml` ou faça upload
3. Em **Environment variables**, defina:
   - `SUPABASE_URL` — URL do Supabase do cliente
   - `SUPABASE_PUBLISHABLE_KEY` — Chave anon do cliente
   - `APP_PORT` — porta de publicação (padrão: `3000`)
4. Clique em **Deploy the stack**

### 10.4 Multi-tenant: Uma Imagem, Vários Clientes

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

### 10.5 Verificar

```bash
docker service ls
docker service logs agis_agis-lp --tail 50
curl -I http://localhost:3000
```

### 10.6 Trocar Supabase sem Rebuild

Para apontar para outro projeto Supabase:

**Via Portainer:** Stacks → agis → Environment → editar variáveis → Update

**Via CLI:**
```bash
SUPABASE_URL="https://novo-projeto.supabase.co" \
SUPABASE_PUBLISHABLE_KEY="eyJ_nova_chave..." \
docker stack deploy -c deploy/docker-stack.yml agis
```

O container reinicia e gera novo `runtime-config.js` automaticamente.

### 10.7 Atualizar a Stack (código novo)

Após rebuild da imagem:

```bash
docker service update --image agis-lp:latest agis_agis-lp
```

Ou via Portainer: **Stacks → agis → Update the stack** (com `Re-pull image` marcado).

### 10.8 Rollback

```bash
docker service rollback agis_agis-lp
```

Ou via Portainer: **Services → agis_agis-lp → Rollback**.

### 10.9 Usar com Traefik no Swarm

No `docker-stack.yml`:
1. Remova a seção `ports`
2. Descomente as labels do Traefik no bloco `deploy`
3. Descomente a rede `traefik-public`
4. Substitua `seudominio.com.br` pelo seu domínio
5. Deploy: `docker stack deploy -c deploy/docker-stack.yml agis`

### 10.10 Diferenças: Compose vs Swarm

| Aspecto | `docker-compose.yml` | `docker-stack.yml` |
|---------|---------------------|--------------------|
| Modo | `docker compose up -d` | `docker stack deploy` |
| Build | Suporta `build:` inline | Requer imagem pré-construída |
| Config | Runtime via `environment:` | Runtime via `environment:` |
| Restart | `restart: unless-stopped` | `deploy.restart_policy` |
| Update | Rebuild + recreate | Rolling update com rollback |
| Rede | `bridge` | `overlay` |

---

## 11. Banco de Dados (Primeira Instalação)

Execute `deploy/migration-master.sql` no **SQL Editor** do Supabase para criar tabelas, RLS e dados iniciais.

> **Pré-requisito:** A função `public.has_role()` e a tabela `user_roles` devem existir antes de executar a migration. Elas são necessárias para as policies de governança (audit log e versionamento).

---

## 12. Governança — Histórico e Versionamento

O projeto inclui duas tabelas de governança protegidas por RLS (somente admins):

| Tabela | Finalidade |
|--------|-----------|
| `admin_audit_log` | Registra todas as alterações feitas no painel admin |
| `page_versions` | Snapshots completos da configuração para restauração |

### Funcionalidades no Admin

| Recurso | Aba | Descrição |
|---------|-----|-----------|
| Histórico de alterações | 18. Histórico | Log de quem alterou, quando, o quê, valor anterior/novo |
| Excluir registro individual | 18. Histórico | Botão 🗑️ com confirmação |
| Limpar histórico por período | 18. Histórico | Escolha 30/60/90/180 dias, remove registros anteriores |
| Limpar todo o histórico | 18. Histórico | Botão destructive com confirmação forte |
| Salvar versão | 17. Versões | Snapshot de todas as `site_settings` |
| Restaurar versão | 17. Versões | Upsert do snapshot + reload automático |
| Excluir versão individual | 17. Versões | Botão 🗑️ com confirmação (bloqueia exclusão da última) |
| Limpeza inteligente de versões | 17. Versões | Manter últimas 3/5/10/20, remover o restante |

### Retenção recomendada

- **Histórico:** limpar registros acima de 90 dias periodicamente
- **Versões:** manter no máximo 10 versões ativas

### Validação pós-instalação

```sql
-- Verificar tabelas existem
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('admin_audit_log', 'page_versions');

-- Verificar RLS está ativo
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('admin_audit_log', 'page_versions');

-- Verificar policies existem (deve retornar 3 para audit_log, 4 para page_versions)
SELECT tablename, count(*) FROM pg_policies WHERE tablename IN ('admin_audit_log', 'page_versions') GROUP BY tablename;
```

### Testar permissões

1. Faça login como admin → vá em **17. Versões** → salve uma versão → restaure → exclua
2. Vá em **18. Histórico** → verifique que as ações aparecem → exclua um registro → limpe por período
3. Abra o site em aba anônima → confirme que não há acesso às tabelas de governança

---

## Comandos Rápidos

| Ação | Comando |
|------|---------|
| Subir | `docker compose up -d` |
| Parar | `docker compose down` |
| Reiniciar | `docker compose restart` |
| Rebuild | `docker compose build --no-cache && docker compose up -d` |
| Logs | `docker compose logs -f` |
| Status | `docker compose ps` |
| Trocar Supabase | Editar `.env` → `docker compose restart` |

---

## Checklist Final para Publicar

- [ ] `.env` criado com `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`
- [ ] `docker compose build` executou sem erros
- [ ] Container saudável (`healthy` no healthcheck)
- [ ] Logs mostram `runtime-config.js generated successfully`
- [ ] `curl http://localhost:3000` retorna 200
- [ ] Domínio apontado para o IP da VPS
- [ ] HTTPS configurado (Certbot, NPM ou Traefik)
- [ ] Site URL configurada no Supabase Dashboard
- [ ] Redirect URLs configuradas no Supabase Dashboard
- [ ] Leaked Password Protection ativada
- [ ] Migration SQL executada no Supabase (`migration-master.sql`)
- [ ] Função `has_role()` e tabela `user_roles` existem
- [ ] Tabelas `admin_audit_log` e `page_versions` criadas com RLS
- [ ] Bootstrap do primeiro admin concluído
- [ ] Login em `/admin/login` funcionando
- [ ] Histórico e versionamento funcionando no admin
