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

Preencha com seus valores reais:

| Variável | Descrição | Onde encontrar |
|----------|-----------|----------------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Dashboard → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave anon/pública | Dashboard → Settings → API |
| `APP_PORT` | Porta local (padrão: 3000) | Sua preferência |

> ⚠️ **NUNCA** coloque a `service_role` key no `.env` do frontend. Ela dá acesso total ao banco.

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

## 4. Verificar Saúde do Container

```bash
# Status geral
docker compose ps

# Healthcheck detalhado
docker compose ps --format "table {{.Name}}\t{{.Status}}"

# Testar resposta HTTP (use a porta definida em APP_PORT, ex: 3000)
curl -I http://localhost:3000
```

Deve retornar `HTTP/1.1 200 OK`.

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

---

## 7. Rollback Simples

Se a nova versão apresentar problemas, siga estes passos para voltar a uma versão anterior.

### 7.1 Identificar o commit anterior

```bash
cd agis-digital-lp
git log --oneline -5
```

Exemplo de saída:

```
a1b2c3d  feat: nova seção de depoimentos
e4f5g6h  fix: ajuste no botão CTA
i7j8k9l  chore: atualizar dependências
```

### 7.2 Voltar para o commit desejado

```bash
git checkout e4f5g6h
```

> ⚠️ **Atenção:** Este comando coloca o repositório em **detached HEAD** — você não estará em nenhuma branch. Isso é normal e esperado para rollback temporário. Não faça commits neste estado.

### 7.3 Rebuildar e subir

```bash
cd deploy
docker compose build --no-cache
docker compose up -d
```

### 7.4 Verificar se voltou corretamente

```bash
docker compose ps
curl -I http://localhost:3000
```

> Substitua `3000` pela porta definida em `APP_PORT` no seu `.env`.

### 7.5 Retornar para a branch principal

Quando a versão mais recente estiver corrigida, volte para `main`:

```bash
cd agis-digital-lp
git checkout main
git pull origin main
cd deploy
docker compose build --no-cache
docker compose up -d
```

> Isso sai do detached HEAD e retorna ao fluxo normal de desenvolvimento.

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

> Substitua `3000` pela porta que definiu em `APP_PORT` no seu `.env`.

```bash
sudo ln -s /etc/nginx/sites-available/agis /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

### Opção B: Nginx Proxy Manager

1. Aponte o domínio para o IP da VPS
2. No NPM, crie um Proxy Host apontando para `http://IP_INTERNO:3000` (substitua `3000` pela porta definida em `APP_PORT`)
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
- Crie o usuário admin diretamente no Supabase Dashboard → Authentication → Users

**Sobre `localStorage`:**
- A sessão é persistida em `localStorage` — funciona bem em produção com HTTPS
- O token é renovado automaticamente antes de expirar
- Se o usuário limpar o navegador, precisará fazer login novamente

**⚠️ Limitação atual de segurança:**
- Qualquer usuário autenticado no Supabase Auth pode acessar `/admin`
- Não existe verificação de role (admin, moderator, etc.) no código atual
- Para restringir acesso, implemente uma tabela `user_roles` com RLS e uma função `has_role()` no Supabase
- Enquanto essa verificação não existir, **não crie usuários desnecessários** no Supabase Auth

---

## 10. Deploy via Docker Swarm / Portainer

O projeto inclui `deploy/docker-stack.yml` otimizado para Swarm.

### 10.1 Pré-requisito: Build da Imagem

Docker Swarm **não suporta `build` inline**. Construa a imagem antes:

```bash
docker build \
  --build-arg VITE_SUPABASE_URL="https://xxx.supabase.co" \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..." \
  -f deploy/Dockerfile \
  -t agis-lp:latest .
```

> Em clusters multi-node, publique a imagem num registry (Docker Hub, GitHub Container Registry, registry privado) e atualize o campo `image:` no stack file.

### 10.2 Deploy via CLI

```bash
docker stack deploy -c deploy/docker-stack.yml agis
```

### 10.3 Deploy via Portainer

1. Acesse **Stacks → Add stack**
2. Cole o conteúdo de `deploy/docker-stack.yml` ou faça upload
3. Em **Environment variables**, defina:
   - `APP_PORT` — porta de publicação (padrão: `3000`)
4. Clique em **Deploy the stack**

> As variáveis Vite (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) são embutidas no build. Elas **não são** variáveis de runtime — defina apenas `APP_PORT` no Portainer.

### 10.4 Verificar

```bash
docker service ls
docker service logs agis_agis-lp --tail 50
curl -I http://localhost:3000
```

### 10.5 Atualizar a Stack

Após rebuild da imagem:

```bash
docker service update --image agis-lp:latest agis_agis-lp
```

Ou via Portainer: **Stacks → agis → Update the stack** (com `Re-pull image` marcado).

O `update_config` garante **zero-downtime** com `order: start-first` — o novo container sobe antes do antigo ser removido.

### 10.6 Rollback

```bash
docker service rollback agis_agis-lp
```

Ou via Portainer: **Services → agis_agis-lp → Rollback**.

O `rollback_config` está configurado com `order: stop-first` para liberar recursos rapidamente.

### 10.7 Usar com Traefik no Swarm

No `docker-stack.yml`:
1. Remova a seção `ports`
2. Descomente as labels do Traefik no bloco `deploy`
3. Descomente a rede `traefik-public`
4. Substitua `seudominio.com.br` pelo seu domínio
5. Deploy: `docker stack deploy -c deploy/docker-stack.yml agis`

### 10.8 Diferenças: Compose vs Swarm

| Aspecto | `docker-compose.yml` | `docker-stack.yml` |
|---------|---------------------|--------------------|
| Modo | `docker compose up -d` | `docker stack deploy` |
| Build | Suporta `build:` inline | Requer imagem pré-construída |
| Restart | `restart: unless-stopped` | `deploy.restart_policy` |
| Update | Rebuild + recreate | Rolling update com rollback |
| Rede | `bridge` | `overlay` |
| Healthcheck | Container-level | Orchestrator-managed |
| Rollback | Manual (git checkout) | `docker service rollback` |
| Porta | `ports: "3000:80"` | `mode: ingress` (load balanced) |

---

## 11. Banco de Dados (Primeira Instalação)

Execute `deploy/migration-master.sql` no **SQL Editor** do Supabase para criar tabelas, RLS e dados iniciais.

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

---

## Checklist Final para Publicar

- [ ] `.env` criado com valores reais do Supabase
- [ ] `docker compose build` executou sem erros
- [ ] Container saudável (`healthy` no healthcheck)
- [ ] `curl http://localhost:3000` retorna 200 (substitua pela porta em `APP_PORT`)
- [ ] Domínio apontado para o IP da VPS
- [ ] HTTPS configurado (Certbot, NPM ou Traefik)
- [ ] Site URL configurada no Supabase Dashboard
- [ ] Redirect URLs configuradas no Supabase Dashboard
- [ ] Leaked Password Protection ativada
- [ ] Migration SQL executada no Supabase
- [ ] Usuário admin criado no Supabase Auth
- [ ] Login em `/admin/login` funcionando
