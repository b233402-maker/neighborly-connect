
-- Karma trigger: +5 when someone offers help
CREATE OR REPLACE FUNCTION public.karma_on_help_offer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Give +5 karma to the helper
  UPDATE public.profiles SET karma = karma + 5 WHERE user_id = NEW.user_id;
  
  -- Notify the post author
  INSERT INTO public.notifications (user_id, actor_id, type, action, target, post_id)
  SELECT p.author_id, NEW.user_id, 'help', 'offered to help on your post', p.title, p.id
  FROM public.posts p WHERE p.id = NEW.post_id AND p.author_id != NEW.user_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_help_offer_insert
  AFTER INSERT ON public.help_offers
  FOR EACH ROW EXECUTE FUNCTION public.karma_on_help_offer();

-- Karma trigger: +10 when help offer is accepted (fulfilled)
CREATE OR REPLACE FUNCTION public.karma_on_help_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Give +10 karma to the helper for fulfilled help
    UPDATE public.profiles SET karma = karma + 10 WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_help_offer_accepted
  AFTER UPDATE ON public.help_offers
  FOR EACH ROW EXECUTE FUNCTION public.karma_on_help_accepted();
