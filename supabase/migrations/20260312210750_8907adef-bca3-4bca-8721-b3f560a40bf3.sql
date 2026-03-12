
CREATE TABLE public.certificate_features (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id uuid NOT NULL REFERENCES public.certificate_prices(id) ON DELETE CASCADE,
  text text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'check',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.certificate_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read features" ON public.certificate_features FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can insert features" ON public.certificate_features FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update features" ON public.certificate_features FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete features" ON public.certificate_features FOR DELETE TO authenticated USING (true);

-- Migrate existing data from certificate_prices columns
INSERT INTO public.certificate_features (certificate_id, text, icon, sort_order)
SELECT id, feature_1, 'check', 1 FROM public.certificate_prices WHERE feature_1 != '';

INSERT INTO public.certificate_features (certificate_id, text, icon, sort_order)
SELECT id, feature_2, 'check', 2 FROM public.certificate_prices WHERE feature_2 != '';

INSERT INTO public.certificate_features (certificate_id, text, icon, sort_order)
SELECT id, feature_3, 'check', 3 FROM public.certificate_prices WHERE feature_3 != '';

INSERT INTO public.certificate_features (certificate_id, text, icon, sort_order)
SELECT id, feature_4, 'headphones', 4 FROM public.certificate_prices WHERE feature_4 != '';
