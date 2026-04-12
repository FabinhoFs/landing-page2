/**
 * Runtime Configuration
 *
 * In Docker containers, config is injected via /runtime-config.js which sets
 * window.RUNTIME_CONFIG before the app bundle loads.
 *
 * In development (Vite dev server), falls back to import.meta.env.
 */

declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      SUPABASE_URL?: string;
      SUPABASE_PUBLISHABLE_KEY?: string;
    };
  }
}

function get(key: 'SUPABASE_URL' | 'SUPABASE_PUBLISHABLE_KEY'): string {
  // 1. Runtime config (Docker/Nginx)
  const runtimeValue = window.RUNTIME_CONFIG?.[key];
  if (runtimeValue) return runtimeValue;

  // 2. Vite build-time fallback (dev server / legacy builds)
  const viteKey = `VITE_${key}`;
  const viteValue = (import.meta.env as Record<string, string | undefined>)[viteKey];
  if (viteValue) return viteValue;

  return '';
}

export const runtimeConfig = {
  get supabaseUrl(): string {
    return get('SUPABASE_URL');
  },
  get supabasePublishableKey(): string {
    return get('SUPABASE_PUBLISHABLE_KEY');
  },

  /** Throws if required config is missing. Called once at app startup. */
  validate(): void {
    const missing: string[] = [];
    if (!this.supabaseUrl) missing.push('SUPABASE_URL');
    if (!this.supabasePublishableKey) missing.push('SUPABASE_PUBLISHABLE_KEY');

    if (missing.length > 0) {
      throw new Error(
        `[RuntimeConfig] Missing required configuration: ${missing.join(', ')}. ` +
        `Set them as environment variables in your Docker container/stack.`
      );
    }
  },
};
