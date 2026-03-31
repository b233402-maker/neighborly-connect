
-- Add attachment columns to messages table
ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS attachment_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS attachment_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS attachment_name text DEFAULT NULL;

-- Create chat-attachments storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Anyone can view chat attachments (public bucket)
CREATE POLICY "Anyone can view chat attachments"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'chat-attachments');

-- RLS: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload chat attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can delete their own attachments
CREATE POLICY "Users can delete own chat attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
