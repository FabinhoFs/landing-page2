-- =============================================
-- UPGRADE: Personalização por UTM
-- Execute no SQL Editor do Supabase para bancos
-- que já existem e precisam dessa feature.
-- Para bancos novos, use migration-master.sql.
-- =============================================

-- 1. Criar tabela utm_rules
CREATE TABLE IF NOT EXISTS public.utm_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  priority integer NOT NULL DEFAULT 0,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  overrides jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.utm_rules ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_utm_rules_status ON public.utm_rules(status);
CREATE INDEX IF NOT EXISTS idx_utm_rules_priority ON public.utm_rules(priority DESC);

-- 2. Criar tabela utm_events (tracking)
CREATE TABLE IF NOT EXISTS public.utm_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES public.utm_rules(id) ON DELETE SET NULL,
  rule_name text,
  event_type text NOT NULL, -- impression, click
  button_id text,
  session_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  overrides_applied jsonb,
  ip text,
  city text,
  region text,
  device text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.utm_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_utm_events_rule ON public.utm_events(rule_id);
CREATE INDEX IF NOT EXISTS idx_utm_events_created ON public.utm_events(created_at DESC);

-- 3. RLS policies

-- utm_rules: anon reads active only, admin manages
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='utm_rules' AND policyname='Anon read active utm rules') THEN
    CREATE POLICY "Anon read active utm rules" ON public.utm_rules FOR SELECT TO anon USING (status = 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='utm_rules' AND policyname='Auth read all utm rules') THEN
    CREATE POLICY "Auth read all utm rules" ON public.utm_rules FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='utm_rules' AND policyname='Auth insert utm rules') THEN
    CREATE POLICY "Auth insert utm rules" ON public.utm_rules FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='utm_rules' AND policyname='Auth update utm rules') THEN
    CREATE POLICY "Auth update utm rules" ON public.utm_rules FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='utm_rules' AND policyname='Auth delete utm rules') THEN
    CREATE POLICY "Auth delete utm rules" ON public.utm_rules FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- utm_events: anyone inserts (tracking), auth reads, admin deletes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='utm_events' AND policyname='Anyone can insert utm events') THEN
    CREATE POLICY "Anyone can insert utm events" ON public.utm_events FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='utm_events' AND policyname='Auth read utm events') THEN
    CREATE POLICY "Auth read utm events" ON public.utm_events FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='utm_events' AND policyname='Auth delete utm events') THEN
    CREATE POLICY "Auth delete utm events" ON public.utm_events FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
