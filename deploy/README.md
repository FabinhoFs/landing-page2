# 🚀 Deploy — Agis Digital LP

Guia completo para deploy em VPS Ubuntu/Debian com Docker.

---

## Pré-requisitos

- VPS com Ubuntu 22+ ou Debian 12+
- Docker Engine 24+ e Docker Compose v2+
- Domínio apontando para o IP da VPS (opcional, para HTTPS)

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
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Dashboard > Settings > API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave anon/pública | Dashboard > Settings > API |
| `APP_PORT` | Porta local (padrão: 3000) | Sua preferência |

> ⚠️ **NUNCA** coloque a `service_role` key no `.env` do frontend. Ela dá acesso total ao banco.

---

## 3. Build e Subir em Produção

```bash
cd deploy

# Build da imagem
docker compose build

# Subir o container
docker compose up -d
```

Pronto! A aplicação estará rodando em `http://SEU_IP:3000`.

---

## 4. Verificar se Está Saudável

```bash
# Status do container
docker compose ps

# Healthcheck
docker inspect --format='{{.State.Health.Status}}' deploy-agis-lp-1

# Testar resposta
curl -I http://localhost:3000
```

Deve retornar `HTTP/1.1 200 OK`.

---

## 5. Ver Logs

```bash
# Logs em tempo real
docker compose logs -f agis-lp

# Últimas 100 linhas
docker compose logs --tail=100 agis-lp
```

---

## 6. Atualizar a Aplicação

Após fazer push de novas alterações no repositório:

```bash
cd agis-digital-lp
git pull origin main

cd deploy
docker compose build --no-cache
docker compose up -d
```

> O `--no-cache` garante que o build use o código mais recente.

---

## 7. Configurar Domínio + HTTPS

### Opção A: Nginx Reverse Proxy + Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Crie o arquivo `/etc/nginx/sites-available/agis`:

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

# Gerar certificado SSL
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

### Opção B: Traefik (Docker Swarm)

Se já usa Traefik, edite o `docker-compose.yml`:
1. Remova a seção `ports`
2. Descomente as labels do Traefik
3. Substitua `seudominio.com.br` pelo seu domínio
4. Use `docker stack deploy -c deploy/docker-compose.yml agis`

---

## 8. Ajustes no Supabase para Produção

Acesse o [Dashboard do Supabase](https://supabase.com/dashboard):

### 8.1 URL do Site
- **Authentication > URL Configuration > Site URL**
- Defina: `https://seudominio.com.br`

### 8.2 Redirect URLs
- **Authentication > URL Configuration > Redirect URLs**
- Adicione: `https://seudominio.com.br/**`

### 8.3 CORS (se necessário)
- Por padrão, o Supabase aceita requisições de qualquer origem
- Para restringir, vá em **Settings > API > CORS Allowed Origins**

### 8.4 Leaked Password Protection
- **Authentication > Attack Protection > Enable Leaked Password Protection**
- Ative para impedir uso de senhas vazadas

### 8.5 Rate Limiting
- **Authentication > Rate Limits**
- Configure limites adequados para login (ex: 5 tentativas/minuto)

---

## 9. Banco de Dados (Primeira Instalação)

Execute o arquivo `deploy/migration-master.sql` no **SQL Editor** do Supabase para criar tabelas, RLS e dados iniciais.

---

## Estrutura de Arquivos

```
deploy/
├── Dockerfile            # Multi-stage: Node build → Nginx Alpine
├── docker-compose.yml    # Compose para produção
├── nginx.conf            # Nginx SPA config (fallback index.html)
├── migration-master.sql  # SQL consolidado (tabelas + RLS + dados)
└── README.md             # Este arquivo

.dockerignore             # Exclui node_modules, .git, .env, etc.
.env.example              # Template de variáveis de ambiente
```

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
| Health | `docker inspect --format='{{.State.Health.Status}}' deploy-agis-lp-1` |
