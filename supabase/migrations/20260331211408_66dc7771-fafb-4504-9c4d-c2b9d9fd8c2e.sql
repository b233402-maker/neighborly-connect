
-- 1. FIX: Profiles email exposure
-- Replace the open SELECT policy with restricted ones
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. FIX: user_roles privilege escalation
-- The ALL policy for admins already covers INSERT for admins.
-- We need to add a restrictive INSERT policy to block non-admins.
-- First, drop any existing permissive INSERT policy if one exists, then add admin-only INSERT.
CREATE POLICY "Only admins can assign roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. FIX: notifications unrestricted insert
-- All notification inserts happen via SECURITY DEFINER triggers, so remove the client INSERT policy.
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
