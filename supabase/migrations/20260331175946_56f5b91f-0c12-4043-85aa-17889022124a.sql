-- Fix: Scope post-images INSERT policy to user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
CREATE POLICY "Users upload to own folder in post-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'post-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);