
-- Create the bootstrap_first_admin RPC
-- This function allows the FIRST admin to be created without manual SQL,
-- but ONLY if zero admins exist and the correct bootstrap key is provided.
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(_bootstrap_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _expected_hash text := 'de6357a9fd64f70da9dc118ad318d11dc90afc36994fcf80ff2ff36b384f3087';
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

  -- 3. Validate the bootstrap key via SHA-256 hash comparison
  _provided_hash := encode(digest(_bootstrap_key, 'sha256'), 'hex');

  IF _provided_hash IS DISTINCT FROM _expected_hash THEN
    RAISE EXCEPTION 'Chave de bootstrap inválida.';
  END IF;

  -- 4. Grant admin role to the authenticated user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin');
END;
$$;

-- Ensure pgcrypto is available for digest()
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
