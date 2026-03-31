
-- Function to notify nearby users when a new post is created
CREATE OR REPLACE FUNCTION public.notify_nearby_users_on_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  nearby_user RECORD;
  post_lat double precision;
  post_lng double precision;
  default_lat double precision := 40.7128;
  default_lng double precision := -74.006;
  dist_km double precision;
  max_radius_km double precision := 50;
BEGIN
  post_lat := NEW.lat;
  post_lng := NEW.lng;

  -- Skip if post has no real location (default NYC coords)
  IF post_lat IS NULL OR post_lng IS NULL THEN
    RETURN NEW;
  END IF;
  IF abs(post_lat - default_lat) < 0.0001 AND abs(post_lng - default_lng) < 0.0001 THEN
    RETURN NEW;
  END IF;

  -- Find all users with real locations within max_radius_km
  FOR nearby_user IN
    SELECT user_id, lat, lng, privacy_level
    FROM public.profiles
    WHERE user_id != NEW.author_id
      AND lat IS NOT NULL AND lng IS NOT NULL
      AND NOT (abs(lat - default_lat) < 0.0001 AND abs(lng - default_lng) < 0.0001)
  LOOP
    -- Haversine distance in km
    dist_km := 6371 * 2 * asin(sqrt(
      power(sin(radians(nearby_user.lat - post_lat) / 2), 2) +
      cos(radians(post_lat)) * cos(radians(nearby_user.lat)) *
      power(sin(radians(nearby_user.lng - post_lng) / 2), 2)
    ));

    -- Only notify if within discovery radius (max 50km)
    IF dist_km <= max_radius_km THEN
      INSERT INTO public.notifications (user_id, actor_id, type, action, target, post_id)
      VALUES (nearby_user.user_id, NEW.author_id, 'nearby_post', 'posted nearby', NEW.title, NEW.id);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Trigger on new post insert
CREATE TRIGGER on_new_post_notify_nearby
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_nearby_users_on_post();
