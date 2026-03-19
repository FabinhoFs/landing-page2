
-- Corrigir política pública: permitir leitura de TODAS as chaves de site_settings
-- (contém apenas conteúdo de exibição da landing page, nada sensível)
DROP POLICY IF EXISTS "Public read tracking keys only" ON public.site_settings;

CREATE POLICY "Public read all settings"
  ON public.site_settings
  FOR SELECT
  TO anon
  USING (true);
