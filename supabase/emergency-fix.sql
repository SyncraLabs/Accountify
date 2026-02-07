-- EMERGENCY FIX - Won't delete data, just fixes policies
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ENSURE GROUPS TABLE HAS created_by COLUMN
-- ============================================

ALTER TABLE groups ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================
-- 2. DROP ALL EXISTING POLICIES (clean slate)
-- ============================================

-- Groups policies
DROP POLICY IF EXISTS "groups_insert" ON groups;
DROP POLICY IF EXISTS "groups_select" ON groups;
DROP POLICY IF EXISTS "groups_update" ON groups;
DROP POLICY IF EXISTS "groups_insert_policy" ON groups;
DROP POLICY IF EXISTS "groups_select_policy" ON groups;
DROP POLICY IF EXISTS "groups_update_policy" ON groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Groups are visible to members" ON groups;
DROP POLICY IF EXISTS "Enable all access for auth users" ON groups;

-- Group members policies
DROP POLICY IF EXISTS "gm_read" ON group_members;
DROP POLICY IF EXISTS "gm_join" ON group_members;
DROP POLICY IF EXISTS "gm_leave" ON group_members;
DROP POLICY IF EXISTS "gm_admin_update" ON group_members;
DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "group_members_insert" ON group_members;
DROP POLICY IF EXISTS "group_members_delete" ON group_members;
DROP POLICY IF EXISTS "group_members_update" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Members are visible to fellow members" ON group_members;
DROP POLICY IF EXISTS "Enable all access for auth users on members" ON group_members;

-- Messages policies
DROP POLICY IF EXISTS "messages_read" ON messages;
DROP POLICY IF EXISTS "messages_write" ON messages;
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "Members can view messages" ON messages;
DROP POLICY IF EXISTS "Members can insert messages" ON messages;
DROP POLICY IF EXISTS "Enable all access for auth users on messages" ON messages;

-- ============================================
-- 3. ENABLE RLS
-- ============================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. GROUPS POLICIES
-- ============================================

-- Anyone can create a group (simple policy)
CREATE POLICY "allow_create_groups" ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Members can view groups they belong to
CREATE POLICY "allow_view_groups" ON groups
  FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Members can update groups (for now, allow all members)
CREATE POLICY "allow_update_groups" ON groups
  FOR UPDATE
  TO authenticated
  USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- ============================================
-- 5. GROUP_MEMBERS POLICIES
-- ============================================

-- Users can view members in their groups
CREATE POLICY "allow_view_members" ON group_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Users can join groups
CREATE POLICY "allow_join_groups" ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can leave groups
CREATE POLICY "allow_leave_groups" ON group_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own membership or admins can update others
CREATE POLICY "allow_update_members" ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );

-- ============================================
-- 6. MESSAGES POLICIES
-- ============================================

-- Ensure messages table exists
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  type TEXT DEFAULT 'text',
  media_url TEXT
);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS habit_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS habit_title TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS habit_streak INTEGER;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS habit_category TEXT;

-- Members can view messages in their groups
CREATE POLICY "allow_view_messages" ON messages
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Members can send messages to their groups
CREATE POLICY "allow_send_messages" ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- ============================================
-- 7. ENABLE REALTIME
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END
$$;

-- ============================================
-- 8. RELOAD SCHEMA
-- ============================================

NOTIFY pgrst, 'reload schema';

-- ============================================
-- DONE! Test by creating a group.
-- ============================================
