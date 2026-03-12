INSERT INTO public.site_settings (key, value) VALUES
  ('popup_enabled', 'true'),
  ('popup_discount', '20'),
  ('popup_title', 'ESPERA! NÃO VÁ EMBORA.'),
  ('popup_subtitle', 'Garanta um desconto exclusivo para emitir seu Certificado Digital agora.')
ON CONFLICT (key) DO NOTHING;