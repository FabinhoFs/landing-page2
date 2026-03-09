
CREATE INDEX idx_access_logs_created_at ON public.access_logs (created_at DESC);
CREATE INDEX idx_access_logs_button_id ON public.access_logs (button_id);
CREATE INDEX idx_access_logs_city ON public.access_logs (city);

-- Policy for authenticated delete (cleanup)
CREATE POLICY "Authenticated can delete access logs" ON public.access_logs
  FOR DELETE TO authenticated USING (true);
