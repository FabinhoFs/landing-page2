
CREATE TABLE public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  button_id TEXT NOT NULL,
  ip TEXT,
  city TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public insert so anonymous visitors can log
CREATE POLICY "Anyone can insert access logs" ON public.access_logs
  FOR INSERT WITH CHECK (true);

-- Only authenticated can read
CREATE POLICY "Authenticated can read access logs" ON public.access_logs
  FOR SELECT TO authenticated USING (true);
