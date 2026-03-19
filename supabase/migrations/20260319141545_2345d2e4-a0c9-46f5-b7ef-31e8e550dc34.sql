
-- ============================================================
-- SEGURANÇA: Políticas RLS refinadas para site_settings
-- ============================================================

-- Remover políticas antigas permissivas
DROP POLICY IF EXISTS "Anyone can read settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated can insert settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated can update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated can delete settings" ON public.site_settings;

-- Garantir RLS ativo
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 1. SELECT público: apenas chaves de rastreamento (pixels/tags)
CREATE POLICY "Public read tracking keys only"
  ON public.site_settings
  FOR SELECT
  TO anon
  USING (
    key IN ('g_tag_id', 'g_ads_purchase_label', 'meta_pixel_id', 'g_tag_manager_id')
  );

-- 2. SELECT para autenticados: acesso total (admin)
CREATE POLICY "Authenticated read all settings"
  ON public.site_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. INSERT para autenticados
CREATE POLICY "Authenticated insert settings"
  ON public.site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. UPDATE para autenticados
CREATE POLICY "Authenticated update settings"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. DELETE para autenticados
CREATE POLICY "Authenticated delete settings"
  ON public.site_settings
  FOR DELETE
  TO authenticated
  USING (true);
