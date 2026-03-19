-- =============================================
-- AGIS DIGITAL — SQL Migration Mestre (Consolidado)
-- Execute no SQL Editor do Supabase para configurar
-- um banco novo do zero.
-- =============================================

-- 1. TABELAS ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
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

-- 2. RLS POLICIES ─────────────────────────────

-- site_settings
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='Public read all settings') THEN
    CREATE POLICY "Public read all settings" ON public.site_settings FOR SELECT TO anon USING (true);
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

-- Site Settings (UPSERT)
INSERT INTO public.site_settings (key, value) VALUES
  ('whatsapp_number', '5524974022516'),
  ('popup_enabled', 'true'),
  ('popup_discount', '20'),
  ('popup_title', 'ESPERA! NÃO VÁ EMBORA.'),
  ('popup_subtitle', 'Garanta um desconto exclusivo para emitir seu Certificado Digital agora.'),
  ('bestseller_active', 'true'),
  ('bestseller_product', 'cnpj'),
  ('pricing_section_title', 'Escolha seu Certificado Digital e emita agora'),
  ('benefit_1_title', 'Velocidade'),
  ('benefit_1_desc', 'Com facilidade e comodismo, você pode emitir seu Certificado Digital com velocidade em tempo recorde através do nosso atendimento.'),
  ('benefit_2_title', 'Confiança'),
  ('benefit_2_desc', 'Somos uma Autoridade de Registro com vasta experiência de mais de 5 anos no mercado e centenas de profissionais satisfeitos com a emissão de seus Certificados.'),
  ('benefit_3_title', 'Atendimento Personalizado'),
  ('benefit_3_desc', 'Temos pessoas preparadas a todo vapor para te atender da forma mais simples possível com cordialidade e compromisso com o seu objetivo.'),
  ('benefit_4_title', 'Segurança'),
  ('benefit_4_desc', 'Emitir seu Certificado com a Agis é garantia de segurança, nós somos devidamente credenciados pelo Instituto Nacional de tecnologia da Informação (ITI), oferecendo soluções completas em Certificação Digital.'),
  ('diff_1_icon', 'FastForward'),
  ('diff_2_icon', 'ShieldCheck'),
  ('diff_3_icon', 'HeadphonesIcon'),
  ('diff_4_icon', 'Lock'),
  ('social_proof_text', 'Sua identidade digital em boas mãos'),
  ('social_authority_title', 'Atendimento rápido'),
  ('social_experience_text', 'Milhares de certificados emitidos com segurança'),
  ('social_support_text', 'Suporte completo e humanizado'),
  ('support_text', 'Suporte completo e humanizado: em caso de qualquer dúvida, conte conosco do início ao fim.'),
  ('cta_hero', 'Olá! Vi o topo do site e quero meu certificado em {cidade}.'),
  ('cta_header', 'Olá! Quero emitir meu Certificado Digital em {cidade}.'),
  ('cta_floating', 'Olá! Quero emitir meu Certificado Digital.'),
  ('cta_sticky_mobile', 'Olá! Quero emitir meu Certificado Digital em {cidade}.'),
  ('cta_bottom', 'Olá! Li as informações e quero iniciar meu atendimento agora.'),
  ('cta_ecpf', 'Olá! Tenho interesse no e-CPF A1 que vi no site.'),
  ('cta_ecnpj', 'Olá! Tenho interesse no e-CNPJ A1 que vi no site.'),
  ('cta_exit_popup', 'Olá! Vi o desconto de R$ {valor},00 na página e quero aproveitar para emitir meu certificado.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
