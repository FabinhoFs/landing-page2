# 🚀 Deploy — Agis Digital LP

Guia completo para deploy em VPS Ubuntu/Debian com Docker.

---

## Pré-requisitos

- VPS com Ubuntu 22+ ou Debian 12+
- Docker Engine 24+ e Docker Compose v2+

```bash
# Instalar Docker (se ainda não tem)
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

A aplicação estará em `http://SEU_IP:3000`.

---

## 4. Verificar Saúde do Container

```bash
# Status
docker compose ps

# Healthcheck (funciona independente do nome do container)
docker compose ps --format "table {{.Name}}\t{{.Status}}"

# Testar resposta HTTP
curl -I http://localhost:3000
```

Deve retornar `HTTP/1.1 200 OK`.

---

## 5. Ver Logs

```bash
# Tempo real
docker compose logs -f agis-lp

# Últimas 100 linhas
docker compose logs --tail=100 agis-lp
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

Se a nova versão falhar, volte para o commit anterior:

```bash
cd agis-digital-lp
git log --oneline -5           # identificar o hash do commit anterior
git checkout <HASH_ANTERIOR>
cd deploy
docker compose build --no-cache
docker compose up -d
```

Para voltar à branch principal depois:

```bash
git checkout main
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
2. No NPM, crie um Proxy Host → `http://IP_INTERNO:3000`
3. Ative SSL via Let's Encrypt no NPM

### Opção C: Traefik (Docker Swarm)

Edite o `docker-compose.yml`:
1. Remova a seção `ports`
2. Descomente as labels do Traefik e a rede `traefik-public`
3. Substitua `seudominio.com.br` pelo seu domínio
4. Suba com `docker stack deploy -c deploy/docker-compose.yml agis`

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

O painel `/admin` usa Supabase Auth com email/senha e `localStorage` para persistência de sessão. Para produção:

- O domínio final **deve** ser cadastrado como Site URL e Redirect URL no Supabase
- Sessões são renovadas automaticamente via `autoRefreshToken: true`
- Use **HTTPS obrigatoriamente** — cookies e tokens trafegam pela rede
- Crie o usuário admin diretamente no Supabase Dashboard → Authentication → Users

---

## 10. Banco de Dados (Primeira Instalação)

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
| Health | `docker compose ps` |

---

## Checklist Final para Publicar

- [ ] `.env` criado com valores reais do Supabase
- [ ] `docker compose build` executou sem erros
- [ ] Container saudável (`healthy` no healthcheck)
- [ ] `curl http://localhost:3000` retorna 200
- [ ] Domínio apontado para o IP da VPS
- [ ] HTTPS configurado (Certbot, NPM ou Traefik)
- [ ] Site URL configurada no Supabase Dashboard
- [ ] Redirect URLs configuradas no Supabase Dashboard
- [ ] Leaked Password Protection ativada
- [ ] Migration SQL executada no Supabase
- [ ] Usuário admin criado no Supabase Auth
- [ ] Login em `/admin/login` funcionando
