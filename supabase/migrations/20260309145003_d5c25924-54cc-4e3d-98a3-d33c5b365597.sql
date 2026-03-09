
-- FAQs table
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Certificate prices table
CREATE TABLE public.certificate_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  promotional_price NUMERIC(10,2),
  is_promotion_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: public read for faqs
CREATE POLICY "Anyone can read active faqs" ON public.faqs
  FOR SELECT USING (is_active = true);

-- RLS: authenticated users can manage faqs
CREATE POLICY "Authenticated users can insert faqs" ON public.faqs
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update faqs" ON public.faqs
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete faqs" ON public.faqs
  FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all faqs" ON public.faqs
  FOR SELECT TO authenticated USING (true);

-- RLS: public read for prices
CREATE POLICY "Anyone can read prices" ON public.certificate_prices
  FOR SELECT USING (true);

-- RLS: authenticated users can manage prices
CREATE POLICY "Authenticated users can insert prices" ON public.certificate_prices
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update prices" ON public.certificate_prices
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete prices" ON public.certificate_prices
  FOR DELETE TO authenticated USING (true);

-- Seed default FAQs
INSERT INTO public.faqs (question, answer, sort_order) VALUES
  ('Como funciona a emissão do Certificado Digital?', 'O processo é simples: você escolhe o tipo de certificado, envia os documentos necessários e realiza a validação por videoconferência. Em poucos minutos, seu certificado estará pronto para uso.', 1),
  ('Preciso ir presencialmente para emitir?', 'Não! A emissão pode ser feita 100% online, por videoconferência. Você não precisa sair de casa ou do escritório.', 2),
  ('Quais documentos são necessários?', 'Para pessoa física (e-CPF): documento de identidade com foto e CPF. Para pessoa jurídica (e-CNPJ): contrato social, CNPJ e documento do responsável legal.', 3),
  ('Qual a validade do Certificado Digital?', 'Os certificados possuem validade de 1 a 3 anos, dependendo do modelo escolhido. Certificados A1 têm validade de 1 ano e A3 de até 3 anos.', 4),
  ('Posso usar o certificado para o eSocial e SPED?', 'Sim! Nossos certificados são homologados pela ICP-Brasil e compatíveis com todas as obrigações fiscais, incluindo eSocial, SPED, NFe e muito mais.', 5);

-- Seed default price
INSERT INTO public.certificate_prices (name, price, promotional_price, is_promotion_active) VALUES
  ('e-CPF A1', 139.90, 99.90, false),
  ('e-CPF A3', 219.90, 179.90, false),
  ('e-CNPJ A1', 199.90, 159.90, false);
