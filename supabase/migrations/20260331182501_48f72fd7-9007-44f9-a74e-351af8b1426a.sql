
-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: auto-create notification when someone likes a post
CREATE OR REPLACE FUNCTION public.notify_on_post_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id uuid;
  post_title text;
BEGIN
  IF NEW.post_id IS NOT NULL THEN
    SELECT author_id, title INTO post_author_id, post_title
    FROM public.posts WHERE id = NEW.post_id;

    IF post_author_id IS NOT NULL AND post_author_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, actor_id, type, action, target, post_id)
      VALUES (post_author_id, NEW.user_id, 'like', 'liked your post', post_title, NEW.post_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_post_like_notify
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_post_like();

-- Trigger: auto-create notification when someone comments on a post
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id uuid;
  post_title text;
  parent_author_id uuid;
BEGIN
  SELECT author_id, title INTO post_author_id, post_title
  FROM public.posts WHERE id = NEW.post_id;

  -- Notify post author (if commenter is not the author)
  IF post_author_id IS NOT NULL AND post_author_id != NEW.author_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, action, target, post_id)
    VALUES (post_author_id, NEW.author_id, 'comment', 'commented on your post', post_title, NEW.post_id);
  END IF;

  -- Notify parent comment author for replies
  IF NEW.parent_id IS NOT NULL THEN
    SELECT author_id INTO parent_author_id
    FROM public.comments WHERE id = NEW.parent_id;

    IF parent_author_id IS NOT NULL AND parent_author_id != NEW.author_id AND parent_author_id != post_author_id THEN
      INSERT INTO public.notifications (user_id, actor_id, type, action, target, post_id)
      VALUES (parent_author_id, NEW.author_id, 'reply', 'replied to your comment', post_title, NEW.post_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_comment_notify
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_comment();

-- Trigger: notify on new message
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  other_user_id uuid;
BEGIN
  SELECT cp.user_id INTO other_user_id
  FROM public.conversation_participants cp
  WHERE cp.conversation_id = NEW.conversation_id
    AND cp.user_id != NEW.sender_id
  LIMIT 1;

  IF other_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, actor_id, type, action, target)
    VALUES (other_user_id, NEW.sender_id, 'message', 'sent you a message', NULL);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_message();
