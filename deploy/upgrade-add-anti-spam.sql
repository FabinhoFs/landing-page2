-- =============================================
-- UPGRADE: Anti-Spam Frontend (Rate Limiting)
-- Execute no SQL Editor do Supabase para inserir
-- as chaves de configuração do Anti-Spam.
-- =============================================

INSERT INTO public.site_settings (key, value, environment) VALUES
  ('spam_guard_enabled', 'true', 'published'),
  ('spam_max_requests', '20', 'published'),
  ('spam_window_ms', '60000', 'published'),
  ('spam_guard_enabled', 'true', 'draft'),
  ('spam_max_requests', '20', 'draft'),
  ('spam_window_ms', '60000', 'draft')
ON CONFLICT (key, environment) DO NOTHING;
