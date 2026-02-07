-- FINAL FIX FOR MESSAGES PERSISTENCE
-- Simpler approach that definitely works

-- ============================================
-- 1. DROP ALL MESSAGE POLICIES
-- ============================================

DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "Members can view messages" ON messages;
DROP POLICY IF EXISTS "Members can insert messages" ON messages;
DROP POLICY IF EXISTS "Members can send messages" ON messages;
DROP POLICY IF EXISTS "Messages visible to group members" ON messages;
DROP POLICY IF EXISTS "Enable all access for auth users on messages" ON messages;

-- ============================================
-- 2. ENSURE TABLE EXISTS WITH ALL COLUMNS
-- ============================================

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
-- 3. SIMPLE POLICIES THAT WORK
-- ============================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- SELECT: User can see messages if they are in the group
-- Using a direct subquery that doesn't cause recursion
CREATE POLICY "messages_read" ON messages
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT gm.group_id
      FROM group_members gm
      WHERE gm.user_id = auth.uid()
    )
  );

-- INSERT: User can insert messages to groups they belong to
CREATE POLICY "messages_write" ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND group_id IN (
      SELECT gm.group_id
      FROM group_members gm
      WHERE gm.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. VERIFY GROUP_MEMBERS POLICIES ARE CORRECT
-- ============================================

-- Drop and recreate to be sure
DROP POLICY IF EXISTS "group_members_select" ON group_members;
DROP POLICY IF EXISTS "group_members_insert" ON group_members;
DROP POLICY IF EXISTS "group_members_delete" ON group_members;
DROP POLICY IF EXISTS "group_members_update" ON group_members;

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Simple: Users can see all members in groups they belong to
CREATE POLICY "gm_read" ON group_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- Users can join groups
CREATE POLICY "gm_join" ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can leave groups
CREATE POLICY "gm_leave" ON group_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can update
CREATE POLICY "gm_admin_update" ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_members.group_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- 5. ENABLE REALTIME
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
-- 6. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_messages_group_id ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gm_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_gm_group_id ON group_members(group_id);

-- ============================================
-- 7. RELOAD
-- ============================================

NOTIFY pgrst, 'reload schema';
