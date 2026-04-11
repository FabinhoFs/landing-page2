
-- 1. Restrict access_logs SELECT to admins only
DROP POLICY IF EXISTS "Authenticated can read access logs" ON public.access_logs;

CREATE POLICY "Admins can read access logs" ON public.access_logs
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Explicitly deny all writes on user_roles from frontend
-- RLS is enabled but we add explicit deny policies to be safe
-- (No INSERT/UPDATE/DELETE policies = denied by default with RLS enabled)
-- Revoke direct grants to be extra safe
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon;
