-- Fix RLS policy for groups table to allow creators to view their own groups
-- This is necessary for the "INSERT ... RETURNING" to work correctly on group creation

DROP POLICY IF EXISTS "groups_select_simple" ON "groups";

CREATE POLICY "groups_select_simple" ON "groups"
FOR SELECT USING (
  (auth.uid() = created_by) OR
  (id IN ( SELECT group_members.group_id FROM group_members WHERE group_members.user_id = auth.uid() ))
);
