-- =============================================
-- UPGRADE: System Errors Dashboard
-- Execute no SQL Editor do Supabase para criar
-- a tabela de diagnóstico de erros do sistema.
-- =============================================

CREATE TABLE IF NOT EXISTS public.system_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  message text NOT NULL,
  payload jsonb,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_system_errors_created ON public.system_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_errors_resolved ON public.system_errors(resolved);

-- Anon e authenticated podem inserir erros (captura de erros da landing page pública)
CREATE POLICY "Anyone can insert errors"
  ON public.system_errors FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Apenas authenticated pode ler erros
CREATE POLICY "Authenticated can read errors"
  ON public.system_errors FOR SELECT
  TO authenticated
  USING (true);

-- Apenas authenticated pode atualizar (resolver) erros
CREATE POLICY "Authenticated can update errors"
  ON public.system_errors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Apenas authenticated pode deletar erros
CREATE POLICY "Authenticated can delete errors"
  ON public.system_errors FOR DELETE
  TO authenticated
  USING (true);
