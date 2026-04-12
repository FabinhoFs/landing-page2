-- =============================================
-- UPGRADE: Geolocation Settings
-- Adiciona configuração de provedor de geolocalização
-- com suporte a chave PRO e fallback multi-provedor.
-- =============================================

-- published
INSERT INTO public.site_settings (key, value, environment) VALUES
  ('geo_provider', 'ipapi', 'published'),
  ('geo_api_key', '', 'published'),
  ('geo_fallback', 'true', 'published')
ON CONFLICT (key, environment) DO NOTHING;

-- draft
INSERT INTO public.site_settings (key, value, environment) VALUES
  ('geo_provider', 'ipapi', 'draft'),
  ('geo_api_key', '', 'draft'),
  ('geo_fallback', 'true', 'draft')
ON CONFLICT (key, environment) DO NOTHING;
