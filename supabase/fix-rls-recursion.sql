-- FIX RLS RECURSION - Emergency Fix
-- This fixes the infinite recursion error in group_members policy

-- ============================================
-- 1. DROP ALL PROBLEMATIC POLICIES
-- ============================================

DROP POLICY IF EXISTS "group_members_select_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_insert_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_delete_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_update_policy" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Members are visible to fellow members" ON group_members;
DROP POLICY IF EXISTS "Enable all access for auth users on members" ON group_members;

DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "Members can view messages" ON messages;
DROP POLICY IF EXISTS "Members can insert messages" ON messages;
DROP POLICY IF EXISTS "Members can send messages" ON messages;
DROP POLICY IF EXISTS "Messages visible to group members" ON messages;
DROP POLICY IF EXISTS "Enable all access for auth users on messages" ON messages;

DROP POLICY IF EXISTS "groups_insert_policy" ON groups;
DROP POLICY IF EXISTS "groups_select_policy" ON groups;
DROP POLICY IF EXISTS "groups_update_policy" ON groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Groups are visible to members" ON groups;
DROP POLICY IF EXISTS "Enable all access for auth users" ON groups;

-- ============================================
-- 2. CREATE HELPER FUNCTION (SECURITY DEFINER)
-- This function bypasses RLS to check membership
-- ============================================

CREATE OR REPLACE FUNCTION is_group_member(check_group_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = check_group_id
    AND user_id = check_user_id
  );
$$;

-- ============================================
-- 3. GROUP_MEMBERS POLICIES (No recursion)
-- ============================================

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Users can see their own membership records directly
-- And can see other members in groups they belong to (using helper function)
CREATE POLICY "group_members_select" ON group_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_group_member(group_id, auth.uid())
  );

-- Users can join groups (insert themselves)
CREATE POLICY "group_members_insert" ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can leave groups (delete their own record)
CREATE POLICY "group_members_delete" ON group_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can update roles (using helper function)
CREATE POLICY "group_members_update" ON group_members
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
-- 4. GROUPS POLICIES
-- ============================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can create groups
CREATE POLICY "groups_insert" ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Members can view their groups (using helper function)
CREATE POLICY "groups_select" ON groups
  FOR SELECT
  TO authenticated
  USING (is_group_member(id, auth.uid()));

-- Admins can update groups
CREATE POLICY "groups_update" ON groups
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
-- 5. MESSAGES POLICIES
-- ============================================

-- Ensure messages table exists with all columns
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

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Members can view messages in their groups
CREATE POLICY "messages_select" ON messages
  FOR SELECT
  TO authenticated
  USING (is_group_member(group_id, auth.uid()));

-- Members can insert messages in their groups
CREATE POLICY "messages_insert" ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_group_member(group_id, auth.uid())
    AND user_id = auth.uid()
  );

-- ============================================
-- 6. ENABLE REALTIME
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
-- 7. RELOAD SCHEMA
-- ============================================

NOTIFY pgrst, 'reload schema';
