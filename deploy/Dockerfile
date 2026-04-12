# ============================================
# Agis Digital LP — Production Dockerfile
# Multi-stage: Bun build → Nginx Alpine
# ============================================
#
# Runtime config: This image is GENERIC.
# Supabase credentials are injected at container startup
# via environment variables, NOT at build time.

# ---- Stage 1: Build ----
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source and build
# No build args needed — config is injected at runtime
COPY . .
RUN bun run build

# ---- Stage 2: Production server ----
FROM nginx:1.27-alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config for SPA
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script that generates runtime-config.js
COPY deploy/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy static build output
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Healthcheck — verifies Nginx is serving content
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
