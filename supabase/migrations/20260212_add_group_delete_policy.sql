-- Add DELETE policy for groups table
-- Allows group admins to delete their groups

DROP POLICY IF EXISTS "Admins can delete groups" ON public.groups;

CREATE POLICY "Admins can delete groups"
ON public.groups FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = groups.id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'admin'
  )
);

-- Force schema reload
NOTIFY pgrst, 'reload schema';
