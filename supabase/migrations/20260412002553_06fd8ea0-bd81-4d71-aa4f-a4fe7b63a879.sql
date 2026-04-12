
-- Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Drop old version to replace cleanly
DROP FUNCTION IF EXISTS public.bootstrap_first_admin(text);

-- RPC: check if any admin exists (safe global check)
CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.admin_exists() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon;

-- RPC: bootstrap first admin with new key hash
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(_bootstrap_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _expected_hash text := '249586551780869dd217fbdf98782afe424109266685e4a2e854bda0cdc3cc31';
  _provided_hash text;
  _admin_count int;
BEGIN
  -- 1. Must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticação necessária.';
  END IF;

  -- 2. Check if any admin already exists
  SELECT COUNT(*) INTO _admin_count
  FROM public.user_roles
  WHERE role = 'admin';

  IF _admin_count > 0 THEN
    RAISE EXCEPTION 'Bootstrap não disponível: já existe um administrador no sistema.';
  END IF;

  -- 3. Validate the bootstrap key via SHA-256 hash (using extensions.digest explicitly)
  _provided_hash := encode(extensions.digest(_bootstrap_key::bytea, 'sha256'), 'hex');

  IF _provided_hash IS DISTINCT FROM _expected_hash THEN
    RAISE EXCEPTION 'Chave de bootstrap inválida.';
  END IF;

  -- 4. Grant admin role to the authenticated user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin');
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(text) TO authenticated;
