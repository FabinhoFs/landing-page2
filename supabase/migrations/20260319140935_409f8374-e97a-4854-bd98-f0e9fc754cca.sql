
-- ============================================================
-- MIGRAÇÃO CONSOLIDADA: Todas as tabelas e RLS do projeto
-- Certificado Digital - Agis Digital
-- ============================================================

-- 1. TABELA: certificate_prices
CREATE TABLE IF NOT EXISTS public.certificate_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  promotional_price numeric,
  is_promotion_active boolean NOT NULL DEFAULT false,
  promo_expires_at timestamptz,
  feature_1 text NOT NULL DEFAULT '',
  feature_2 text NOT NULL DEFAULT '',
  feature_3 text NOT NULL DEFAULT '',
  feature_4 text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.certificate_prices ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read prices' AND tablename = 'certificate_prices') THEN
    CREATE POLICY "Anyone can read prices" ON public.certificate_prices FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert prices' AND tablename = 'certificate_prices') THEN
    CREATE POLICY "Authenticated users can insert prices" ON public.certificate_prices FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update prices' AND tablename = 'certificate_prices') THEN
    CREATE POLICY "Authenticated users can update prices" ON public.certificate_prices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete prices' AND tablename = 'certificate_prices') THEN
    CREATE POLICY "Authenticated users can delete prices" ON public.certificate_prices FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- 2. TABELA: certificate_features
CREATE TABLE IF NOT EXISTS public.certificate_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid NOT NULL REFERENCES public.certificate_prices(id) ON DELETE CASCADE,
  text text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'check',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.certificate_features ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read features' AND tablename = 'certificate_features') THEN
    CREATE POLICY "Anyone can read features" ON public.certificate_features FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can insert features' AND tablename = 'certificate_features') THEN
    CREATE POLICY "Authenticated can insert features" ON public.certificate_features FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can update features' AND tablename = 'certificate_features') THEN
    CREATE POLICY "Authenticated can update features" ON public.certificate_features FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can delete features' AND tablename = 'certificate_features') THEN
    CREATE POLICY "Authenticated can delete features" ON public.certificate_features FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- 3. TABELA: faqs
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read active faqs' AND tablename = 'faqs') THEN
    CREATE POLICY "Anyone can read active faqs" ON public.faqs FOR SELECT TO public USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read all faqs' AND tablename = 'faqs') THEN
    CREATE POLICY "Authenticated users can read all faqs" ON public.faqs FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert faqs' AND tablename = 'faqs') THEN
    CREATE POLICY "Authenticated users can insert faqs" ON public.faqs FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update faqs' AND tablename = 'faqs') THEN
    CREATE POLICY "Authenticated users can update faqs" ON public.faqs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete faqs' AND tablename = 'faqs') THEN
    CREATE POLICY "Authenticated users can delete faqs" ON public.faqs FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- 4. TABELA: testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  text text NOT NULL,
  role text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 5,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read active testimonials' AND tablename = 'testimonials') THEN
    CREATE POLICY "Anyone can read active testimonials" ON public.testimonials FOR SELECT TO public USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can read all testimonials' AND tablename = 'testimonials') THEN
    CREATE POLICY "Authenticated can read all testimonials" ON public.testimonials FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can insert testimonials' AND tablename = 'testimonials') THEN
    CREATE POLICY "Authenticated can insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can update testimonials' AND tablename = 'testimonials') THEN
    CREATE POLICY "Authenticated can update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can delete testimonials' AND tablename = 'testimonials') THEN
    CREATE POLICY "Authenticated can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- 5. TABELA: site_settings (configurações gerais + integrações/pixels)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read settings' AND tablename = 'site_settings') THEN
    CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can insert settings' AND tablename = 'site_settings') THEN
    CREATE POLICY "Authenticated can insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can update settings' AND tablename = 'site_settings') THEN
    CREATE POLICY "Authenticated can update settings" ON public.site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can delete settings' AND tablename = 'site_settings') THEN
    CREATE POLICY "Authenticated can delete settings" ON public.site_settings FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- Garantir constraint UNIQUE na coluna key (caso já exista a tabela sem ela)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_key_key') THEN
    ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_key_key UNIQUE (key);
  END IF;
END $$;

-- 6. TABELA: access_logs (analytics/rastreamento)
CREATE TABLE IF NOT EXISTS public.access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  button_id text NOT NULL,
  city text,
  region text,
  ip text,
  device text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert access logs' AND tablename = 'access_logs') THEN
    CREATE POLICY "Anyone can insert access logs" ON public.access_logs FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can read access logs' AND tablename = 'access_logs') THEN
    CREATE POLICY "Authenticated can read access logs" ON public.access_logs FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can delete access logs' AND tablename = 'access_logs') THEN
    CREATE POLICY "Authenticated can delete access logs" ON public.access_logs FOR DELETE TO authenticated USING (true);
  END IF;
END $$;
