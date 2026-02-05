-- FAIL-SAFE RLS SCRIPT
-- If the previous policies didn't work, run this to force open permissions for testing.

-- 1. Reset Policies
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Groups are visible to members" ON groups;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Members are visible to fellow members" ON group_members;
DROP POLICY IF EXISTS "Members can send messages" ON messages;
DROP POLICY IF EXISTS "Messages visible to group members" ON messages;

-- 2. Create PERMISSIVE Policies (Authenticated Users Only)

-- Groups: Allow authenticated users to do ANYTHING (Insert, Select, Update, Delete)
CREATE POLICY "Enable all access for auth users" 
ON groups FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Group Members: Allow authenticated users to do ANYTHING
CREATE POLICY "Enable all access for auth users on members" 
ON group_members FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Messages: Allow authenticated users to do ANYTHING
CREATE POLICY "Enable all access for auth users on messages" 
ON messages FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Reload Config
NOTIFY pgrst, 'reload schema';
