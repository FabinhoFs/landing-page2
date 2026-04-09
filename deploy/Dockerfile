# ============================================
# Agis Digital LP — Production Dockerfile
# Multi-stage: Bun build → Nginx Alpine
# ============================================

# ---- Stage 1: Build ----
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Build args — Vite embeds these into static JS at build time
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID

# Install dependencies first (better layer caching)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .
RUN bun run build

# ---- Stage 2: Production server ----
FROM nginx:1.27-alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config for SPA
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Copy static build output
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Healthcheck — verifies Nginx is serving content
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
