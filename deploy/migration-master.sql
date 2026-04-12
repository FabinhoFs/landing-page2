-- =============================================
-- AGIS DIGITAL — SQL Migration Mestre (Consolidado)
-- Execute no SQL Editor do Supabase para configurar
-- um banco novo do zero.
-- =============================================

-- 1. TABELAS ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  value text NOT NULL,
  environment text NOT NULL DEFAULT 'published',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_key_env_unique UNIQUE (key, environment)
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  text text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_google_review boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

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

CREATE TABLE IF NOT EXISTS public.certificate_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid NOT NULL REFERENCES public.certificate_prices(id),
  icon text NOT NULL DEFAULT 'check',
  text text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.certificate_features ENABLE ROW LEVEL SECURITY;

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

CREATE TABLE IF NOT EXISTS public.access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  button_id text NOT NULL,
  ip text,
  city text,
  region text,
  device text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Governança: Audit Log
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text,
  section text NOT NULL,
  entity_key text,
  field_name text,
  old_value text,
  new_value text,
  action_type text NOT NULL DEFAULT 'update',
  metadata jsonb
);
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_section ON public.admin_audit_log(section);

-- Governança: Page Versions
CREATE TABLE IF NOT EXISTS public.page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email text,
  version_name text NOT NULL,
  description text,
  snapshot_json jsonb NOT NULL,
  is_restored boolean DEFAULT false,
  restored_at timestamptz
);
ALTER TABLE public.page_versions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_page_versions_created ON public.page_versions(created_at DESC);

-- Experimentos A/B/C
CREATE TABLE IF NOT EXISTS public.experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  section text NOT NULL,
  experiment_type text NOT NULL DEFAULT 'content',
  status text NOT NULL DEFAULT 'draft',
  traffic_split jsonb NOT NULL DEFAULT '{"A": 34, "B": 33, "C": 33}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ended_at timestamptz
);
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.experiment_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  variant_key text NOT NULL,
  label text NOT NULL DEFAULT '',
  config jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_experiment_variant UNIQUE (experiment_id, variant_key)
);
ALTER TABLE public.experiment_variants ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.experiment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  variant_key text NOT NULL,
  event_type text NOT NULL,
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

-- Personalização por UTM
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

CREATE TABLE IF NOT EXISTS public.utm_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES public.utm_rules(id) ON DELETE SET NULL,
  rule_name text,
  event_type text NOT NULL,
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

-- 2. RLS POLICIES ─────────────────────────────

-- site_settings
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='Public read published settings') THEN
    CREATE POLICY "Public read published settings" ON public.site_settings FOR SELECT TO anon USING (environment = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='Authenticated read all settings') THEN
    CREATE POLICY "Authenticated read all settings" ON public.site_settings FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='Authenticated insert settings') THEN
    CREATE POLICY "Authenticated insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='Authenticated update settings') THEN
    CREATE POLICY "Authenticated update settings" ON public.site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='Authenticated delete settings') THEN
    CREATE POLICY "Authenticated delete settings" ON public.site_settings FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- testimonials
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='Anyone can read active testimonials') THEN
    CREATE POLICY "Anyone can read active testimonials" ON public.testimonials FOR SELECT TO public USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='Authenticated can read all testimonials') THEN
    CREATE POLICY "Authenticated can read all testimonials" ON public.testimonials FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='Authenticated can insert testimonials') THEN
    CREATE POLICY "Authenticated can insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='Authenticated can update testimonials') THEN
    CREATE POLICY "Authenticated can update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='Authenticated can delete testimonials') THEN
    CREATE POLICY "Authenticated can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- certificate_prices
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='certificate_prices' AND policyname='Anyone can read prices') THEN
    CREATE POLICY "Anyone can read prices" ON public.certificate_prices FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='certificate_prices' AND policyname='Authenticated users can insert prices') THEN
    CREATE POLICY "Authenticated users can insert prices" ON public.certificate_prices FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='certificate_prices' AND policyname='Authenticated users can update prices') THEN
    CREATE POLICY "Authenticated users can update prices" ON public.certificate_prices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='certificate_prices' AND policyname='Authenticated users can delete prices') THEN
    CREATE POLICY "Authenticated users can delete prices" ON public.certificate_prices FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- certificate_features
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='certificate_features' AND policyname='Anyone can read features') THEN
    CREATE POLICY "Anyone can read features" ON public.certificate_features FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='certificate_features' AND policyname='Authenticated can insert features') THEN
    CREATE POLICY "Authenticated can insert features" ON public.certificate_features FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='certificate_features' AND policyname='Authenticated can update features') THEN
    CREATE POLICY "Authenticated can update features" ON public.certificate_features FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='certificate_features' AND policyname='Authenticated can delete features') THEN
    CREATE POLICY "Authenticated can delete features" ON public.certificate_features FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- faqs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='faqs' AND policyname='Anyone can read active faqs') THEN
    CREATE POLICY "Anyone can read active faqs" ON public.faqs FOR SELECT TO public USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='faqs' AND policyname='Authenticated users can read all faqs') THEN
    CREATE POLICY "Authenticated users can read all faqs" ON public.faqs FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='faqs' AND policyname='Authenticated users can insert faqs') THEN
    CREATE POLICY "Authenticated users can insert faqs" ON public.faqs FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='faqs' AND policyname='Authenticated users can update faqs') THEN
    CREATE POLICY "Authenticated users can update faqs" ON public.faqs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='faqs' AND policyname='Authenticated users can delete faqs') THEN
    CREATE POLICY "Authenticated users can delete faqs" ON public.faqs FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- experiments
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

-- experiment_variants
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

-- experiment_events
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

-- utm_rules
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

-- utm_events
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

-- access_logs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='access_logs' AND policyname='Anyone can insert access logs') THEN
    CREATE POLICY "Anyone can insert access logs" ON public.access_logs FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='access_logs' AND policyname='Authenticated can read access logs') THEN
    CREATE POLICY "Authenticated can read access logs" ON public.access_logs FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='access_logs' AND policyname='Authenticated can delete access logs') THEN
    CREATE POLICY "Authenticated can delete access logs" ON public.access_logs FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- admin_audit_log (admin-only via has_role)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_audit_log' AND policyname='Admins can read audit log') THEN
    CREATE POLICY "Admins can read audit log" ON public.admin_audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_audit_log' AND policyname='Admins can insert audit log') THEN
    CREATE POLICY "Admins can insert audit log" ON public.admin_audit_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_audit_log' AND policyname='Admins can delete audit log') THEN
    CREATE POLICY "Admins can delete audit log" ON public.admin_audit_log FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- page_versions (admin-only via has_role)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_versions' AND policyname='Admins can read page versions') THEN
    CREATE POLICY "Admins can read page versions" ON public.page_versions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_versions' AND policyname='Admins can insert page versions') THEN
    CREATE POLICY "Admins can insert page versions" ON public.page_versions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_versions' AND policyname='Admins can update page versions') THEN
    CREATE POLICY "Admins can update page versions" ON public.page_versions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_versions' AND policyname='Admins can delete page versions') THEN
    CREATE POLICY "Admins can delete page versions" ON public.page_versions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- 3. DADOS INICIAIS ───────────────────────────

-- Depoimentos (9 avaliações Google)
INSERT INTO public.testimonials (name, role, text, rating, sort_order, is_active, is_google_review) VALUES
  ('Felipe Santos', 'Empresário', 'Sem dúvida um dos melhores atendimentos! Sensacional a ajuda que recebi. Isso faz a diferença em qualquer negócio: pessoas que agem dessa forma e realmente ajudam o cliente.', 5, 1, true, true),
  ('Roberta Dias', 'Advogada', 'Excelente profissional, sempre muito atencioso! Me socorreu em um momento de desespero por não conseguir protocolar uma petição urgente. Graças à Agis, deu tudo certo!', 5, 2, true, true),
  ('Janet Flora Neves Monteiro', 'Empresária', 'Fui muito bem atendida, agradeço pela paciência e atenção de sempre! Excelente profissional. Recomendo com louvor!', 5, 3, true, true),
  ('Bruna Paschoal', 'Contadora', 'Pessoal ágil e super eficiente. Marcamos nossos clientes lá e sempre vemos como o tratamento é diferenciado. Super indico para quem busca parceria de confiança!', 5, 4, true, true),
  ('Fernando Pinto Ribeiro', 'Empresário', 'Excelente atendimento. Rápido e o atendente muito simpático. Tudo resolvido sem burocracia.', 5, 5, true, true),
  ('Luciana Almeida', 'Empresária', 'Empresa extremamente profissional. Atendimento perfeito, equipe atenciosa e correta em todos os detalhes.', 5, 6, true, true),
  ('Diomar Rosa', 'Advogado', 'Excelente atendimento, pessoa atenciosa, educada e com solução rápida para o que eu precisava.', 5, 7, true, true),
  ('Gustavo Mello', 'Empreendedor', 'Profissional diferenciado, atencioso e executou com excelência o que eu precisava em um prazo muito bom. Melhor certificadora da região.', 5, 8, true, true),
  ('Regiane Rosa de Faria', 'Empreendedora', 'Desde o primeiro atendimento pelo Whats foi muito bom! Atendimento rápido e eficiente, parabéns a toda equipe. Super indico!', 5, 9, true, true)
ON CONFLICT DO NOTHING;

-- Certificados
INSERT INTO public.certificate_prices (name, price, promotional_price, is_promotion_active, feature_1, feature_2, feature_3, feature_4) VALUES
  ('e-CPF A1', 135.00, 119.90, true, 'Assine documentos digitalmente', 'Acesso total ao e-CAC da Receita Federal', 'Segurança garantida pelo padrão ICP-Brasil', 'Médicos, Advogados, Produtor Rural'),
  ('e-CNPJ A1', 200.90, 99.00, true, '1Emissão de notas fiscais (NF-e/NFC-e) sem interrupções', '2Conformidade total com FGTS, e-Social e obrigações acessórias', '3Gestão segura de contratos e procurações digitais', '4Autenticação empresarial em sistemas públicos e privados')
ON CONFLICT DO NOTHING;

-- FAQs
INSERT INTO public.faqs (question, answer, is_active, sort_order) VALUES
  ('Como funciona a emissão do Certificado Digital?', 'O processo é simples: você escolhe o tipo de certificado, envia os documentos necessários e realiza a validação por videoconferência. Em poucos minutos, seu certificado estará pronto para uso.', true, 1),
  ('Preciso ir presencialmente para emitir?', 'Não! A emissão pode ser feita 100% online, por videoconferência. Você não precisa sair de casa ou do escritório.', true, 2),
  ('Quais documentos são necessários?', 'Para pessoa física (e-CPF): documento de identidade com foto e CPF. Para pessoa jurídica (e-CNPJ): contrato social, CNPJ e documento do responsável legal.', true, 3),
  ('Qual a validade do Certificado Digital?', 'Os certificados possuem validade de 1 a 3 anos, dependendo do modelo escolhido. Certificados A1 têm validade de 1 ano e A3 de até 3 anos.', true, 4),
  ('Posso usar o certificado para o eSocial e SPED?', 'Sim! Nossos certificados são homologados pela ICP-Brasil e compatíveis com todas as obrigações fiscais, incluindo eSocial, SPED, NFe e muito mais.', true, 5)
ON CONFLICT DO NOTHING;

-- Site Settings — published environment
INSERT INTO public.site_settings (key, value, environment) VALUES
  ('whatsapp_number', '5524974022516', 'published'),
  ('popup_enabled', 'true', 'published'),
  ('popup_discount', '20', 'published'),
  ('popup_title', 'ESPERA! NÃO VÁ EMBORA.', 'published'),
  ('popup_subtitle', 'Garanta um desconto exclusivo para emitir seu Certificado Digital agora.', 'published'),
  ('bestseller_active', 'true', 'published'),
  ('bestseller_product', 'cnpj', 'published'),
  ('pricing_section_title', 'Escolha seu Certificado Digital e emita agora', 'published'),
  ('benefit_1_title', 'Velocidade', 'published'),
  ('benefit_1_desc', 'Com facilidade e comodismo, você pode emitir seu Certificado Digital com velocidade em tempo recorde através do nosso atendimento.', 'published'),
  ('benefit_2_title', 'Confiança', 'published'),
  ('benefit_2_desc', 'Somos uma Autoridade de Registro com vasta experiência de mais de 5 anos no mercado e centenas de profissionais satisfeitos com a emissão de seus Certificados.', 'published'),
  ('benefit_3_title', 'Atendimento Personalizado', 'published'),
  ('benefit_3_desc', 'Temos pessoas preparadas a todo vapor para te atender da forma mais simples possível com cordialidade e compromisso com o seu objetivo.', 'published'),
  ('benefit_4_title', 'Segurança', 'published'),
  ('benefit_4_desc', 'Emitir seu Certificado com a Agis é garantia de segurança, nós somos devidamente credenciados pelo Instituto Nacional de tecnologia da Informação (ITI), oferecendo soluções completas em Certificação Digital.', 'published'),
  ('diff_1_icon', 'FastForward', 'published'),
  ('diff_2_icon', 'ShieldCheck', 'published'),
  ('diff_3_icon', 'HeadphonesIcon', 'published'),
  ('diff_4_icon', 'Lock', 'published'),
  ('social_proof_text', 'Sua identidade digital em boas mãos', 'published'),
  ('social_authority_title', 'Atendimento rápido', 'published'),
  ('social_experience_text', 'Milhares de certificados emitidos com segurança', 'published'),
  ('social_support_text', 'Suporte completo e humanizado', 'published'),
  ('support_text', 'Suporte completo e humanizado: em caso de qualquer dúvida, conte conosco do início ao fim.', 'published'),
  ('cta_hero', 'Olá! Vi o topo do site e quero meu certificado em {cidade}.', 'published'),
  ('cta_header', 'Olá! Quero emitir meu Certificado Digital em {cidade}.', 'published'),
  ('cta_floating', 'Olá! Quero emitir meu Certificado Digital.', 'published'),
  ('cta_sticky_mobile', 'Olá! Quero emitir meu Certificado Digital em {cidade}.', 'published'),
  ('cta_bottom', 'Olá! Li as informações e quero iniciar meu atendimento agora.', 'published'),
  ('cta_ecpf', 'Olá! Tenho interesse no e-CPF A1 que vi no site.', 'published'),
  ('cta_ecnpj', 'Olá! Tenho interesse no e-CNPJ A1 que vi no site.', 'published'),
  ('cta_exit_popup', 'Olá! Vi o desconto de R$ {valor},00 na página e quero aproveitar para emitir meu certificado.', 'published')
ON CONFLICT (key, environment) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Site Settings — draft environment (mirror of published for initial install)
INSERT INTO public.site_settings (key, value, environment)
SELECT key, value, 'draft' FROM public.site_settings WHERE environment = 'published'
ON CONFLICT (key, environment) DO NOTHING;
