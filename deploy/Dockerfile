# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Build args para o Vite gravar nos arquivos estáticos
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY

COPY package.json bun.lock ./
RUN npm install --frozen-lockfile || npm install

COPY . .
RUN npm run build

# ---- Stage 2: Serve ----
FROM nginx:stable-alpine

# Remove config padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia config customizada para SPA
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Copia arquivos estáticos do build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
