-- =============================================
-- UPGRADE: Adicionar tabelas de Teste A/B/C
-- Execute no SQL Editor do Supabase para bancos
-- que já existiam ANTES da feature de experimentos.
-- Para bancos novos, use migration-master.sql (já inclui tudo).
-- =============================================

-- 1. Tabela de experimentos
CREATE TABLE IF NOT EXISTS public.experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  section text NOT NULL,           -- 'hero', 'cta_hero', 'cta_header', etc.
  experiment_type text NOT NULL DEFAULT 'content', -- 'content', 'cta_text', 'cta_message'
  status text NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'paused', 'ended'
  traffic_split jsonb NOT NULL DEFAULT '{"A": 34, "B": 33, "C": 33}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ended_at timestamptz
);
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

-- 2. Tabela de variantes
CREATE TABLE IF NOT EXISTS public.experiment_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  variant_key text NOT NULL,       -- 'A', 'B', 'C'
  label text NOT NULL DEFAULT '',
  config jsonb NOT NULL DEFAULT '{}',  -- arbitrary key-value pairs for the variant
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_experiment_variant UNIQUE (experiment_id, variant_key)
);
ALTER TABLE public.experiment_variants ENABLE ROW LEVEL SECURITY;

-- 3. Tabela de eventos de experimento
CREATE TABLE IF NOT EXISTS public.experiment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  variant_key text NOT NULL,
  event_type text NOT NULL,        -- 'impression', 'click'
  button_id text,
  session_id text,
  ip text,
  city text,
  region text,
  device text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.experiment_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_exp_events_experiment ON public.experiment_events(experiment_id, variant_key);
CREATE INDEX IF NOT EXISTS idx_exp_events_created ON public.experiment_events(created_at DESC);

-- 4. RLS Policies

-- experiments: anon read only active, authenticated full access
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experiments' AND policyname='Anon read active experiments') THEN
    CREATE POLICY "Anon read active experiments" ON public.experiments FOR SELECT TO anon USING (status = 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experiments' AND policyname='Auth read all experiments') THEN
    CREATE POLICY "Auth read all experiments" ON public.experiments FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experiments' AND policyname='Auth insert experiments') THEN
    CREATE POLICY "Auth insert experiments" ON public.experiments FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experiments' AND policyname='Auth update experiments') THEN
    CREATE POLICY "Auth update experiments" ON public.experiments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experiments' AND policyname='Auth delete experiments') THEN
    CREATE POLICY "Auth delete experiments" ON public.experiments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- experiment_variants: anon read via active experiment, auth full
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experiment_variants' AND policyname='Anon read active variants') THEN
    CREATE POLICY "Anon read active variants" ON public.experiment_variants FOR SELECT TO anon
      USING (EXISTS (SELECT 1 FROM public.experiments e WHERE e.id = experiment_id AND e.status = 'active'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experiment_variants' AND policyname='Auth read all variants') THEN
    CREATE POLICY "Auth read all variants" ON public.experiment_variants FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experiment_variants' AND policyname='Auth insert variants') THEN
    CREATE POLICY "Auth insert variants" ON public.experiment_variants FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experiment_variants' AND policyname='Auth update variants') THEN
    CREATE POLICY "Auth update variants" ON public.experiment_variants FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experiment_variants' AND policyname='Auth delete variants') THEN
    CREATE POLICY "Auth delete variants" ON public.experiment_variants FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- experiment_events: anyone can insert (tracking), only auth can read/delete
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experiment_events' AND policyname='Anyone can insert experiment events') THEN
    CREATE POLICY "Anyone can insert experiment events" ON public.experiment_events FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experiment_events' AND policyname='Auth read experiment events') THEN
    CREATE POLICY "Auth read experiment events" ON public.experiment_events FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experiment_events' AND policyname='Auth delete experiment events') THEN
    CREATE POLICY "Auth delete experiment events" ON public.experiment_events FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
