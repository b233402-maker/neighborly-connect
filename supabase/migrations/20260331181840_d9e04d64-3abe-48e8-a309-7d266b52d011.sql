
-- 1. Create a view that excludes email from profiles for public access
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT user_id, display_name, avatar_url, bio, karma, verified, is_pro, privacy_level, lat, lng, created_at, updated_at
FROM public.profiles;

-- 2. Fix broken conversations RLS policy
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversations.id
    AND cp.user_id = auth.uid()
  )
);

-- 3. Add UPDATE policy on post-images storage bucket
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);
