
-- 1. RPC: list all admins (returns email from auth.users joined with user_roles)
CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS TABLE (
  role_id UUID,
  user_id UUID,
  email TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem listar admins.';
  END IF;

  RETURN QUERY
    SELECT
      ur.id AS role_id,
      ur.user_id,
      u.email::TEXT,
      ur.role::TEXT,
      ur.created_at
    FROM public.user_roles ur
    JOIN auth.users u ON u.id = ur.user_id
    WHERE ur.role = 'admin'
    ORDER BY ur.created_at ASC;
END;
$$;

-- 2. RPC: find user by email
CREATE OR REPLACE FUNCTION public.find_user_by_email(_email TEXT)
RETURNS TABLE (
  user_id UUID,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem buscar usuários.';
  END IF;

  -- Validate input
  IF _email IS NULL OR trim(_email) = '' THEN
    RAISE EXCEPTION 'E-mail não pode ser vazio.';
  END IF;

  RETURN QUERY
    SELECT u.id AS user_id, u.email::TEXT
    FROM auth.users u
    WHERE lower(u.email) = lower(trim(_email))
    LIMIT 1;
END;
$$;

-- 3. RPC: promote user to admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem promover usuários.';
  END IF;

  -- Verify target user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado.';
  END IF;

  -- Check if already admin
  IF public.has_role(_user_id, 'admin') THEN
    RAISE EXCEPTION 'Este usuário já é administrador.';
  END IF;

  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin');
END;
$$;

-- 4. RPC: remove admin role
CREATE OR REPLACE FUNCTION public.remove_admin(_user_id UUID, _confirm_self_removal BOOLEAN DEFAULT FALSE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INT;
BEGIN
  -- Verify caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem remover admins.';
  END IF;

  -- Verify target is actually an admin
  IF NOT public.has_role(_user_id, 'admin') THEN
    RAISE EXCEPTION 'Este usuário não é administrador.';
  END IF;

  -- Count current admins
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';

  -- Prevent removing last admin
  IF admin_count <= 1 THEN
    RAISE EXCEPTION 'Não é possível remover o último administrador do sistema.';
  END IF;

  -- Self-removal requires explicit confirmation
  IF _user_id = auth.uid() AND NOT _confirm_self_removal THEN
    RAISE EXCEPTION 'CONFIRM_SELF_REMOVAL: Você está tentando remover seu próprio acesso de administrador. Confirme a ação.';
  END IF;

  -- Remove the role
  DELETE FROM public.user_roles
  WHERE user_id = _user_id AND role = 'admin';
END;
$$;

-- 5. Grant execute to authenticated users (functions handle their own auth checks)
GRANT EXECUTE ON FUNCTION public.list_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_user_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_admin(UUID, BOOLEAN) TO authenticated;
