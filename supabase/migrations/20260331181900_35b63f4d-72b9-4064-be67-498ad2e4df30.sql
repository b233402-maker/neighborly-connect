
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker = on)
AS
SELECT user_id, display_name, avatar_url, bio, karma, verified, is_pro, privacy_level, lat, lng, created_at, updated_at
FROM public.profiles;
