-- COMPLETE FIX - Resolves infinite recursion
-- Run this ENTIRE script in Supabase SQL Editor

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

-- Groups policies
DROP POLICY IF EXISTS "groups_insert" ON groups;
DROP POLICY IF EXISTS "groups_select" ON groups;
DROP POLICY IF EXISTS "groups_update" ON groups;
DROP POLICY IF EXISTS "groups_insert_policy" ON groups;
DROP POLICY IF EXISTS "groups_select_policy" ON groups;
DROP POLICY IF EXISTS "groups_update_policy" ON groups;
DROP POLICY IF EXISTS "allow_create_groups" ON groups;
DROP POLICY IF EXISTS "allow_view_groups" ON groups;
DROP POLICY IF EXISTS "allow_update_groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Groups are visible to members" ON groups;
DROP POLICY IF EXISTS "Enable all access for auth users" ON groups;

-- Group members policies - DROP ALL
DROP POLICY IF EXISTS "gm_read" ON group_members;
DROP POLICY IF EXISTS "gm_join" ON group_members;
DROP POLICY IF EXISTS "gm_leave" ON group_members;
DROP POLICY IF EXISTS "gm_select" ON group_members;
DROP POLICY IF EXISTS "gm_insert" ON group_members;
DROP POLICY IF EXISTS "gm_delete" ON group_members;
DROP POLICY IF EXISTS "gm_update" ON group_members;
DROP POLICY IF EXISTS "gm_admin_update" ON group_members;
DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "group_members_insert" ON group_members;
DROP POLICY IF EXISTS "group_members_delete" ON group_members;
DROP POLICY IF EXISTS "group_members_update" ON group_members;
DROP POLICY IF EXISTS "allow_view_members" ON group_members;
DROP POLICY IF EXISTS "allow_join_groups" ON group_members;
DROP POLICY IF EXISTS "allow_leave_groups" ON group_members;
DROP POLICY IF EXISTS "allow_update_members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Members are visible to fellow members" ON group_members;
DROP POLICY IF EXISTS "Enable all access for auth users on members" ON group_members;

-- Messages policies
DROP POLICY IF EXISTS "messages_read" ON messages;
DROP POLICY IF EXISTS "messages_write" ON messages;
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "allow_view_messages" ON messages;
DROP POLICY IF EXISTS "allow_send_messages" ON messages;
DROP POLICY IF EXISTS "Members can view messages" ON messages;
DROP POLICY IF EXISTS "Members can insert messages" ON messages;
DROP POLICY IF EXISTS "Enable all access for auth users on messages" ON messages;

-- ============================================
-- STEP 2: ENSURE TABLES EXIST
-- ============================================

-- Groups table columns
ALTER TABLE groups ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Messages table
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

-- ============================================
-- STEP 3: ENABLE RLS
-- ============================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: SIMPLE NON-RECURSIVE POLICIES
-- ============================================

-- GROUP_MEMBERS: Simple policies that don't self-reference
-- SELECT: Authenticated users can see all memberships (groups are protected separately)
CREATE POLICY "gm_select" ON group_members
  FOR SELECT TO authenticated
  USING (true);

-- INSERT: Users can only add themselves
CREATE POLICY "gm_insert" ON group_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- DELETE: Users can only remove themselves
CREATE POLICY "gm_delete" ON group_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- UPDATE: Users can update their own record
CREATE POLICY "gm_update" ON group_members
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- GROUPS: Protected by membership check
-- INSERT: Anyone can create a group
CREATE POLICY "groups_insert" ON groups
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- SELECT: Only members can see their groups
CREATE POLICY "groups_select" ON groups
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

-- UPDATE: Only members can update (could restrict to admin later)
CREATE POLICY "groups_update" ON groups
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

-- MESSAGES: Protected by membership check
-- SELECT: Members can read messages in their groups
CREATE POLICY "messages_select" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- INSERT: Members can send messages to their groups
CREATE POLICY "messages_insert" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- ============================================
-- STEP 5: REALTIME
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE messages;
  END IF;
END
$$;

ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================
-- STEP 6: INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_messages_group_id ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gm_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_gm_group_id ON group_members(group_id);

-- ============================================
-- STEP 7: RELOAD SCHEMA
-- ============================================

NOTIFY pgrst, 'reload schema';

-- ============================================
-- DONE!
-- The key fix: group_members SELECT uses USING(true)
-- This prevents infinite recursion because it doesn't
-- query group_members to check group_members access
-- ============================================
