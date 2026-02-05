-- Fix RLS Policies for Groups Feature
-- This script drops existing policies to avoid conflicts and recreates them with correct permissions.

-- 1. Enable RLS on all tables (idempotent)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Groups are visible to members" ON groups;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Members are visible to fellow members" ON group_members;
DROP POLICY IF EXISTS "Members can send messages" ON messages;
DROP POLICY IF EXISTS "Messages visible to group members" ON messages;

-- 3. Recreate Policies

-- GROUPS TABLE
-- Allow any authenticated user to create a group
CREATE POLICY "Authenticated users can create groups" 
ON groups FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

-- Allow members to view their groups
CREATE POLICY "Groups are visible to members" 
ON groups FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  )
);

-- GROUP MEMBERS TABLE
-- Allow users to insert themselves (join) OR group admins to add members
CREATE POLICY "Users can join groups" 
ON group_members FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow members to view other members in their groups
CREATE POLICY "Members are visible to fellow members" 
ON group_members FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM group_members gm 
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid()
  )
);

-- MESSAGES TABLE
-- Allow members to send messages to their groups
CREATE POLICY "Members can send messages" 
ON messages FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = messages.group_id 
    AND group_members.user_id = auth.uid()
  )
);

-- Allow members to view messages in their groups
CREATE POLICY "Messages visible to group members" 
ON messages FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = messages.group_id 
    AND group_members.user_id = auth.uid()
  )
);

-- 4. Reload Schema
NOTIFY pgrst, 'reload schema';
