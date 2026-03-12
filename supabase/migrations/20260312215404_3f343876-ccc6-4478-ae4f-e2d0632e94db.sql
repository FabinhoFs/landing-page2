
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  text text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active testimonials" ON public.testimonials FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Authenticated can read all testimonials" ON public.testimonials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (true);

-- Seed initial testimonials
INSERT INTO public.testimonials (name, role, text, rating, sort_order) VALUES
('Maria Silva', 'Contadora', 'Processo muito rápido e sem complicação. Recebi meu e-CPF no mesmo dia! Recomendo a Agis Digital.', 5, 1),
('Carlos Oliveira', 'Empresário', 'Precisava do e-CNPJ com urgência e a equipe da Agis me atendeu prontamente. Excelente atendimento!', 5, 2),
('Ana Santos', 'Advogada', 'Atendimento personalizado e muito profissional. A videoconferência foi simples e rápida. Super indico!', 5, 3);
