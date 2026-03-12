
UPDATE public.certificate_prices SET 
  feature_1 = 'Assinar documentos de qualquer lugar com validade jurídica',
  feature_2 = 'Acesso total ao e-CAC e serviços da Receita Federal',
  feature_3 = 'Segurança garantida pelo padrão ICP-Brasil',
  feature_4 = 'Declaração de IR e consultas sem filas ou burocracia'
WHERE name LIKE 'e-CPF%';

UPDATE public.certificate_prices SET 
  feature_1 = 'Emissão de notas fiscais (NF-e/NFC-e) sem interrupções',
  feature_2 = 'Conformidade total com FGTS, e-Social e obrigações acessórias',
  feature_3 = 'Gestão segura de contratos e procurações digitais',
  feature_4 = 'Autenticação empresarial em sistemas públicos e privados'
WHERE name LIKE 'e-CNPJ%';
