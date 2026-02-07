-- FIX CHAT PERSISTENCE - Complete Solution
-- Run this script in Supabase SQL Editor to fix all chat-related issues

-- ============================================
-- 1. ENSURE MESSAGES TABLE EXISTS WITH ALL COLUMNS
-- ============================================

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  type TEXT DEFAULT 'text',
  media_url TEXT
);

-- Add any missing columns for habit sharing
ALTER TABLE messages ADD COLUMN IF NOT EXISTS habit_id UUID REFERENCES habits(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS habit_title TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS habit_streak INTEGER;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS habit_category TEXT;

-- ============================================
-- 2. CLEAN UP ALL EXISTING RLS POLICIES
-- ============================================

-- Drop all possible existing policies on messages
DROP POLICY IF EXISTS "Members can view messages" ON messages;
DROP POLICY IF EXISTS "Members can insert messages" ON messages;
DROP POLICY IF EXISTS "Members can send messages" ON messages;
DROP POLICY IF EXISTS "Messages visible to group members" ON messages;
DROP POLICY IF EXISTS "Enable all access for auth users on messages" ON messages;

-- ============================================
-- 3. CREATE CORRECT RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Members can SELECT messages in their groups
CREATE POLICY "messages_select_policy" ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Policy: Members can INSERT messages in their groups
CREATE POLICY "messages_insert_policy" ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- The user must be a member of the group
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = messages.group_id
      AND group_members.user_id = auth.uid()
    )
    -- And the user_id must match the authenticated user
    AND user_id = auth.uid()
  );

-- ============================================
-- 4. FIX GROUP_MEMBERS RLS (required for message policies to work)
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Members are visible to fellow members" ON group_members;
DROP POLICY IF EXISTS "Enable all access for auth users on members" ON group_members;

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Members can view fellow members
CREATE POLICY "group_members_select_policy" ON group_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

-- Users can join groups (insert themselves)
CREATE POLICY "group_members_insert_policy" ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can leave groups (delete themselves)
CREATE POLICY "group_members_delete_policy" ON group_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can update roles
CREATE POLICY "group_members_update_policy" ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );

-- ============================================
-- 5. FIX GROUPS TABLE RLS
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Groups are visible to members" ON groups;
DROP POLICY IF EXISTS "Enable all access for auth users" ON groups;

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Anyone can create groups
CREATE POLICY "groups_insert_policy" ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Members can view their groups
CREATE POLICY "groups_select_policy" ON groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

-- Admins can update groups
CREATE POLICY "groups_update_policy" ON groups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

-- ============================================
-- 6. ENABLE REALTIME FOR MESSAGES
-- ============================================

-- First remove from publication if exists (to avoid error)
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

-- Now add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================
-- 7. CREATE INDEX FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_messages_group_id ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_group_created ON messages(group_id, created_at DESC);

-- ============================================
-- 8. RELOAD SCHEMA CACHE
-- ============================================

NOTIFY pgrst, 'reload schema';

-- ============================================
-- VERIFICATION QUERY - Run separately to test
-- ============================================
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd
-- FROM pg_policies
-- WHERE tablename = 'messages';
