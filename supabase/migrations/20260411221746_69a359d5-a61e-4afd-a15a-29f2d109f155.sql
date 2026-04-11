
-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. RLS: users can only read their own roles
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies — roles are managed via Dashboard/SQL only

-- 5. Create SECURITY DEFINER function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Tighten content table policies: replace "authenticated = true" with admin role check

-- certificate_prices
DROP POLICY IF EXISTS "Authenticated users can insert prices" ON public.certificate_prices;
DROP POLICY IF EXISTS "Authenticated users can update prices" ON public.certificate_prices;
DROP POLICY IF EXISTS "Authenticated users can delete prices" ON public.certificate_prices;

CREATE POLICY "Admins can insert prices" ON public.certificate_prices
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update prices" ON public.certificate_prices
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete prices" ON public.certificate_prices
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- certificate_features
DROP POLICY IF EXISTS "Authenticated can insert features" ON public.certificate_features;
DROP POLICY IF EXISTS "Authenticated can update features" ON public.certificate_features;
DROP POLICY IF EXISTS "Authenticated can delete features" ON public.certificate_features;

CREATE POLICY "Admins can insert features" ON public.certificate_features
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update features" ON public.certificate_features
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete features" ON public.certificate_features
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- faqs
DROP POLICY IF EXISTS "Authenticated users can insert faqs" ON public.faqs;
DROP POLICY IF EXISTS "Authenticated users can update faqs" ON public.faqs;
DROP POLICY IF EXISTS "Authenticated users can delete faqs" ON public.faqs;

CREATE POLICY "Admins can insert faqs" ON public.faqs
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update faqs" ON public.faqs
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete faqs" ON public.faqs
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- testimonials
DROP POLICY IF EXISTS "Authenticated can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated can delete testimonials" ON public.testimonials;

CREATE POLICY "Admins can insert testimonials" ON public.testimonials
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update testimonials" ON public.testimonials
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete testimonials" ON public.testimonials
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- site_settings
DROP POLICY IF EXISTS "Authenticated insert settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated delete settings" ON public.site_settings;

CREATE POLICY "Admins can insert settings" ON public.site_settings
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings" ON public.site_settings
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete settings" ON public.site_settings
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- access_logs: keep public INSERT, restrict DELETE to admin
DROP POLICY IF EXISTS "Authenticated can delete access logs" ON public.access_logs;

CREATE POLICY "Admins can delete access logs" ON public.access_logs
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
