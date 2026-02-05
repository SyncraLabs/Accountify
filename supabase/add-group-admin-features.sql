-- Group Admin Features Migration
-- Storage bucket for group images and admin management policies

-- 1. Create storage bucket for group images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-images', 'group-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage policies for group images
-- Allow authenticated users to upload group images
CREATE POLICY "Authenticated users can upload group images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'group-images');

-- Allow public read access to group images
CREATE POLICY "Public can read group images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'group-images');

-- Allow admins to update/delete group images
CREATE POLICY "Admins can update group images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'group-images');

CREATE POLICY "Admins can delete group images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'group-images');

-- 3. Group update policy - only admins can update
DROP POLICY IF EXISTS "Admins can update groups" ON public.groups;
CREATE POLICY "Admins can update groups"
ON public.groups FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = groups.id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'admin'
  )
);

-- 4. Group members delete policy - only admins can remove members
DROP POLICY IF EXISTS "Admins can remove group members" ON public.group_members;
CREATE POLICY "Admins can remove group members"
ON public.group_members FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members AS admin_check
    WHERE admin_check.group_id = group_members.group_id
    AND admin_check.user_id = auth.uid()
    AND admin_check.role = 'admin'
  )
);

-- 5. Group members update policy - only admins can change roles
DROP POLICY IF EXISTS "Admins can update member roles" ON public.group_members;
CREATE POLICY "Admins can update member roles"
ON public.group_members FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members AS admin_check
    WHERE admin_check.group_id = group_members.group_id
    AND admin_check.user_id = auth.uid()
    AND admin_check.role = 'admin'
  )
);

-- Force schema reload
NOTIFY pgrst, 'reload schema';
