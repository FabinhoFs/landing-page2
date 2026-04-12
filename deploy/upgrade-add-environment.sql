-- =============================================
-- UPGRADE: Adicionar coluna 'environment' à tabela site_settings
-- Execute este script no SQL Editor do Supabase para bancos
-- que já existiam ANTES da feature de rascunho/publicação.
-- Para bancos novos, use migration-master.sql (já inclui tudo).
-- =============================================

-- 1. Adicionar coluna environment (se não existir)
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS environment text NOT NULL DEFAULT 'published';

-- 2. Remover constraint antiga (key único) e criar nova (key + environment)
-- A constraint antiga pode ter nomes variados; tentamos os mais comuns.
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_key_key;
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_key_unique;
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey_key;

-- Criar a constraint composta (ignora se já existir)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'site_settings_key_env_unique'
  ) THEN
    ALTER TABLE public.site_settings
    ADD CONSTRAINT site_settings_key_env_unique UNIQUE (key, environment);
  END IF;
END $$;

-- 3. Todos os registros existentes já são 'published' (pelo DEFAULT).
--    Agora criamos cópia como 'draft' para o admin poder editar.
INSERT INTO public.site_settings (key, value, environment, updated_at)
SELECT key, value, 'draft', now()
FROM public.site_settings
WHERE environment = 'published'
ON CONFLICT (key, environment) DO NOTHING;

-- 4. Atualizar RLS: anon só lê published
-- Primeiro remover policies antigas que podem conflitar
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public read published settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can read settings" ON public.site_settings;

CREATE POLICY "Public read published settings"
  ON public.site_settings FOR SELECT TO anon
  USING (environment = 'published');

-- Garantir que authenticated pode tudo (admin usa has_role no app)
DROP POLICY IF EXISTS "Authenticated read all settings" ON public.site_settings;
CREATE POLICY "Authenticated read all settings"
  ON public.site_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated insert settings" ON public.site_settings;
CREATE POLICY "Authenticated insert settings"
  ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated update settings" ON public.site_settings;
CREATE POLICY "Authenticated update settings"
  ON public.site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated delete settings" ON public.site_settings;
CREATE POLICY "Authenticated delete settings"
  ON public.site_settings FOR DELETE TO authenticated USING (true);

-- 5. Verificação
SELECT
  column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'site_settings' AND column_name = 'environment';
