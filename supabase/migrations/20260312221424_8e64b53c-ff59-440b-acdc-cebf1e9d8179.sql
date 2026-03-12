ALTER TABLE public.access_logs ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.access_logs ADD COLUMN IF NOT EXISTS device text;