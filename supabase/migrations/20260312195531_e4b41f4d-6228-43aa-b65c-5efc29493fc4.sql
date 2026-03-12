INSERT INTO public.site_settings (key, value) VALUES
  ('social_authority_title', 'Atendimento humanizado'),
  ('social_proof_text', 'Junte-se a centenas de clientes que confiam em nossa emissão oficial.'),
  ('social_experience_text', 'Milhares de certificados emitidos com segurança')
ON CONFLICT (key) DO NOTHING;