
-- Create a security definer function to check conversation membership
-- This avoids the infinite recursion when conversation_participants policy references itself
CREATE OR REPLACE FUNCTION public.is_conversation_member(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE user_id = _user_id AND conversation_id = _conversation_id
  )
$$;

-- Fix conversation_participants SELECT policy (self-referencing causes recursion)
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
CREATE POLICY "Users can view participants of their conversations"
  ON public.conversation_participants FOR SELECT
  TO public
  USING (public.is_conversation_member(auth.uid(), conversation_id));

-- Fix conversations SELECT policy (references conversation_participants which has recursive policy)
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT
  TO public
  USING (public.is_conversation_member(auth.uid(), id));

-- Fix messages SELECT policy (references conversation_participants which has recursive policy)
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  TO public
  USING (public.is_conversation_member(auth.uid(), conversation_id));

-- Fix messages INSERT policy (references conversation_participants which has recursive policy)
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "Users can send messages to their conversations"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.is_conversation_member(auth.uid(), conversation_id));
