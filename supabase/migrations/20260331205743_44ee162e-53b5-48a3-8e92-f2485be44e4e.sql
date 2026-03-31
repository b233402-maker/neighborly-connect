
CREATE OR REPLACE FUNCTION public.notify_on_help_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  post_title text;
  post_id_val uuid;
  post_author_id uuid;
BEGIN
  IF NEW.status != OLD.status AND NEW.status IN ('accepted', 'rejected') THEN
    SELECT id, title, author_id INTO post_id_val, post_title, post_author_id
    FROM public.posts WHERE id = NEW.post_id;

    INSERT INTO public.notifications (user_id, actor_id, type, action, target, post_id)
    VALUES (
      NEW.user_id,
      post_author_id,
      'help',
      CASE WHEN NEW.status = 'accepted' THEN 'accepted your help offer on' ELSE 'declined your help offer on' END,
      post_title,
      post_id_val
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_help_offer_response
  AFTER UPDATE ON public.help_offers
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_help_response();
