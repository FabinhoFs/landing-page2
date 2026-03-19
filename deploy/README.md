# Deploy — Agis Digital LP

## Pré-requisitos
- Docker + Docker Swarm inicializado (`docker swarm init`)
- Traefik rodando com rede externa `traefik-public`
- Domínio apontando para o IP da VPS

## 1. Build da Imagem

```bash
docker build \
  --build-arg VITE_SUPABASE_URL="https://hvpilqrvoktoyhfnbwhl.supabase.co" \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY="SUA_ANON_KEY" \
  -f deploy/Dockerfile \
  -t agis-lp:latest .
```

## 2. Deploy no Swarm

Edite `deploy/docker-compose.yml` e substitua `seudominio.com.br` pelo seu domínio real.

```bash
# Crie um .env no diretório deploy/ (opcional, para o build local):
echo 'VITE_SUPABASE_URL=https://hvpilqrvoktoyhfnbwhl.supabase.co' > deploy/.env
echo 'VITE_SUPABASE_PUBLISHABLE_KEY=SUA_ANON_KEY' >> deploy/.env

# Deploy da stack
docker stack deploy -c deploy/docker-compose.yml agis
```

## 3. Build Args no Docker Swarm

As variáveis `VITE_*` são **build-time** (gravadas nos arquivos JS estáticos pelo Vite). Portanto:

- Passe via `--build-arg` no `docker build`
- **Não** precisam ser secrets do Swarm (são públicas/anon keys)
- Após o build, os valores ficam embutidos nos arquivos `.js` do `/dist`

## 4. Banco de Dados

Execute o arquivo `deploy/migration-master.sql` no **SQL Editor** do Supabase para configurar tabelas, RLS e dados iniciais de um banco novo.

## 5. Verificação

```bash
# Checar se o serviço está rodando
docker service ls

# Logs do serviço
docker service logs agis_agis-lp

# Testar localmente
curl -I https://seudominio.com.br
```

## Estrutura

```
deploy/
├── Dockerfile            # Multi-stage: Node build + Nginx serve
├── docker-compose.yml    # Stack para Docker Swarm + Traefik labels
├── nginx.conf            # Config SPA (fallback para index.html)
├── migration-master.sql  # SQL consolidado (tabelas + RLS + dados)
└── README.md             # Este arquivo
```
