-- =============================================
-- UPGRADE: Exit Intent Popup Settings
-- Execute no SQL Editor do Supabase para adicionar
-- as configurações do popup de retenção.
-- =============================================

INSERT INTO public.site_settings (key, value, environment) VALUES
  ('popup_enabled', 'true', 'published'),
  ('popup_trigger_desktop', 'true', 'published'),
  ('popup_trigger_mobile_scroll', 'true', 'published'),
  ('popup_trigger_mobile_back', 'false', 'published'),
  ('popup_title', 'ESPERA! NÃO VÁ EMBORA.', 'published'),
  ('popup_subtitle', 'Garanta um desconto exclusivo para emitir seu Certificado Digital agora.', 'published'),
  ('popup_discount_value', '20', 'published')
ON CONFLICT (key, environment) DO NOTHING;

INSERT INTO public.site_settings (key, value, environment) VALUES
  ('popup_enabled', 'true', 'draft'),
  ('popup_trigger_desktop', 'true', 'draft'),
  ('popup_trigger_mobile_scroll', 'true', 'draft'),
  ('popup_trigger_mobile_back', 'false', 'draft'),
  ('popup_title', 'ESPERA! NÃO VÁ EMBORA.', 'draft'),
  ('popup_subtitle', 'Garanta um desconto exclusivo para emitir seu Certificado Digital agora.', 'draft'),
  ('popup_discount_value', '20', 'draft')
ON CONFLICT (key, environment) DO NOTHING;
