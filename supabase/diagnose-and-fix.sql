-- DIAGNOSE AND FIX MESSAGES ISSUE
-- Run this ENTIRE script in Supabase SQL Editor

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

-- Messages policies
DROP POLICY IF EXISTS "messages_read" ON messages;
DROP POLICY IF EXISTS "messages_write" ON messages;
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "messages_select_simple" ON messages;
DROP POLICY IF EXISTS "messages_insert_simple" ON messages;
DROP POLICY IF EXISTS "Members can view messages" ON messages;
DROP POLICY IF EXISTS "Members can insert messages" ON messages;
-- Newly identified conflicting policies
DROP POLICY IF EXISTS "messages_select_all" ON messages;
DROP POLICY IF EXISTS "messages_insert_own" ON messages;
DROP POLICY IF EXISTS "Group members can view messages" ON messages;
DROP POLICY IF EXISTS "Group members can send messages" ON messages;
DROP POLICY IF EXISTS "msg_select" ON messages;
DROP POLICY IF EXISTS "msg_insert" ON messages;

-- Group members policies
DROP POLICY IF EXISTS "gm_read" ON group_members;
DROP POLICY IF EXISTS "gm_join" ON group_members;
DROP POLICY IF EXISTS "gm_leave" ON group_members;
DROP POLICY IF EXISTS "gm_select" ON group_members;
DROP POLICY IF EXISTS "gm_insert" ON group_members;
DROP POLICY IF EXISTS "gm_delete" ON group_members;
DROP POLICY IF EXISTS "gm_update" ON group_members;
DROP POLICY IF EXISTS "gm_select_simple" ON group_members;
DROP POLICY IF EXISTS "gm_insert_simple" ON group_members;
DROP POLICY IF EXISTS "gm_delete_simple" ON group_members;
DROP POLICY IF EXISTS "gm_update_simple" ON group_members;
DROP POLICY IF EXISTS "gm_admin_update" ON group_members;

-- Groups policies
DROP POLICY IF EXISTS "groups_insert" ON groups;
DROP POLICY IF EXISTS "groups_select" ON groups;
DROP POLICY IF EXISTS "groups_update" ON groups;
DROP POLICY IF EXISTS "groups_insert_simple" ON groups;
DROP POLICY IF EXISTS "groups_select_simple" ON groups;
DROP POLICY IF EXISTS "groups_update_simple" ON groups;

-- ============================================
-- STEP 2: ENABLE RLS
-- ============================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: CREATE SIMPLE NON-RECURSIVE POLICIES
-- ============================================

-- GROUP_MEMBERS: Allow all authenticated to read (prevents recursion)
CREATE POLICY "gm_select_simple" ON group_members
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "gm_insert_simple" ON group_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "gm_delete_simple" ON group_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "gm_update_simple" ON group_members
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- GROUPS
CREATE POLICY "groups_insert_simple" ON groups
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "groups_select_simple" ON groups
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "groups_update_simple" ON groups
  FOR UPDATE TO authenticated
  USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- MESSAGES
CREATE POLICY "messages_select_simple" ON messages
  FOR SELECT TO authenticated
  USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "messages_insert_simple" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- ============================================
-- STEP 4: ENABLE REALTIME
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
-- STEP 5: ADD MISSING FOREIGN KEYS
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_user_id_fkey'
  ) THEN
    ALTER TABLE messages 
    ADD CONSTRAINT messages_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE;
  END IF;
END
$$;

-- ============================================
-- STEP 6: CREATE INDEXES
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
-- DONE! Check results below:
-- ============================================

SELECT 'Messages count:' as check, COUNT(*) as result FROM messages;
SELECT 'Policies on messages:' as check, policyname as result FROM pg_policies WHERE tablename = 'messages';
