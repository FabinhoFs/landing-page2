CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can update settings" ON public.site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete settings" ON public.site_settings FOR DELETE TO authenticated USING (true);

INSERT INTO public.site_settings (key, value) VALUES ('whatsapp_number', '5524974022516');