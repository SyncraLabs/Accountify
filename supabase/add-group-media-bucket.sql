-- Storage bucket for group chat media
-- 1. Create storage bucket for group media
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-media', 'group-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage policies for group media
-- Allow authenticated users to upload group media
CREATE POLICY "Authenticated users can upload group media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'group-media');

-- Allow public read access to group media
CREATE POLICY "Public can read group media"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'group-media');

-- Allow users to update/delete their own media (good practice)
CREATE POLICY "Users can update own group media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'group-media' AND owner = auth.uid());

CREATE POLICY "Users can delete own group media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'group-media' AND owner = auth.uid());
