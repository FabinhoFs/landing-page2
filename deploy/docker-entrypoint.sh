#!/bin/sh
set -e

CONFIG_PATH="/usr/share/nginx/html/runtime-config.js"

# ── Validate required variables ──
MISSING=""
if [ -z "$SUPABASE_URL" ]; then
  MISSING="$MISSING SUPABASE_URL"
fi
if [ -z "$SUPABASE_PUBLISHABLE_KEY" ]; then
  MISSING="$MISSING SUPABASE_PUBLISHABLE_KEY"
fi

if [ -n "$MISSING" ]; then
  echo "================================================================"
  echo "  ERROR: Missing required environment variables:$MISSING"
  echo ""
  echo "  Set them in your Docker Compose, Swarm stack, or Portainer."
  echo "  Example:"
  echo "    SUPABASE_URL=https://xxx.supabase.co"
  echo "    SUPABASE_PUBLISHABLE_KEY=eyJ..."
  echo "================================================================"
  exit 1
fi

# ── Generate runtime-config.js ──
cat > "$CONFIG_PATH" <<EOF
window.RUNTIME_CONFIG = {
  SUPABASE_URL: "${SUPABASE_URL}",
  SUPABASE_PUBLISHABLE_KEY: "${SUPABASE_PUBLISHABLE_KEY}"
};
EOF

echo "[entrypoint] runtime-config.js generated successfully."

# ── Start Nginx ──
exec nginx -g "daemon off;"
