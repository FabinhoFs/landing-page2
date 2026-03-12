INSERT INTO public.site_settings (key, value) VALUES
  ('cta_hero', 'Olá! Vi o topo do site e quero meu certificado em {cidade}.'),
  ('cta_ecpf', 'Olá! Tenho interesse no e-CPF A1 que vi no site.'),
  ('cta_ecnpj', 'Olá! Tenho interesse no e-CNPJ A1 que vi no site.'),
  ('cta_floating', 'Olá! Quero emitir meu Certificado Digital.'),
  ('cta_bottom', 'Olá! Li as informações e quero iniciar meu atendimento agora.'),
  ('cta_header', 'Olá! Quero emitir meu Certificado Digital em {cidade}.'),
  ('cta_sticky_mobile', 'Olá! Quero emitir meu Certificado Digital em {cidade}.'),
  ('cta_exit_popup', 'Olá! Vi a oferta de 20% OFF para Certificado Digital em {cidade}. Quero aproveitar!')
ON CONFLICT (key) DO NOTHING;