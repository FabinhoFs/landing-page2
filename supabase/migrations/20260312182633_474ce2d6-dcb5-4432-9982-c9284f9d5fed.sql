
ALTER TABLE public.certificate_prices 
  ADD COLUMN IF NOT EXISTS promo_expires_at timestamp with time zone DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS feature_1 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS feature_2 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS feature_3 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS feature_4 text NOT NULL DEFAULT '';
