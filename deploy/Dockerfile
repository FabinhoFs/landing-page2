# ============================================
# Agis Digital LP — Production Dockerfile
# Multi-stage: Node 20 build → Nginx Alpine
# ============================================

# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Build args — Vite embeds these into static JS at build time
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY

# Install dependencies first (better layer caching)
COPY package.json bun.lock ./
RUN npm install --frozen-lockfile || npm install

# Copy source and build
COPY . .
RUN npm run build

# ---- Stage 2: Production server ----
FROM nginx:1.27-alpine

# Security: run as non-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config for SPA
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Copy static build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Fix permissions
RUN chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

EXPOSE 80

# Healthcheck — verifies Nginx is serving content
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
