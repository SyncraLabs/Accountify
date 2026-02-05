-- Group Challenges Migration

-- 1. Challenges Table
CREATE TABLE group_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'count', -- 'count', 'streak', 'duration', etc.
  target_value INTEGER NOT NULL,
  unit TEXT NOT NULL, -- 'veces', 'días', 'minutos', 'km', etc.
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Participants Table
CREATE TABLE challenge_participants (
  challenge_id UUID REFERENCES group_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (challenge_id, user_id)
);

-- 3. Progress Entries Table
CREATE TABLE challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES group_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  value INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  note TEXT
);

-- Enable RLS
ALTER TABLE group_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: View Challenges
-- Members of the group can view challenges
CREATE POLICY "Group members can view challenges"
ON group_challenges FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_challenges.group_id
    AND group_members.user_id = auth.uid()
  )
);

-- 5. RLS Policy: Create Challenges
-- Only group admins can create challenges
CREATE POLICY "Group admins can create challenges"
ON group_challenges FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_challenges.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'admin'
  )
);

-- 6. RLS Policy: Update Challenges
-- Only group admins can update challenges
CREATE POLICY "Group admins can update challenges"
ON group_challenges FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_challenges.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'admin'
  )
);

-- 7. RLS Policy: Delete Challenges
-- Only group admins can delete challenges
CREATE POLICY "Group admins can delete challenges"
ON group_challenges FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_challenges.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'admin'
  )
);

-- 8. Participants RLS
-- Anyone in the group can join a challenge
CREATE POLICY "Group members can join challenges"
ON challenge_participants FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_challenges
    JOIN group_members ON group_members.group_id = group_challenges.group_id
    WHERE group_challenges.id = challenge_participants.challenge_id
    AND group_members.user_id = auth.uid()
  )
);

-- Participants can view other participants
CREATE POLICY "Participants viewable by group members"
ON challenge_participants FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_challenges
    JOIN group_members ON group_members.group_id = group_challenges.group_id
    WHERE group_challenges.id = challenge_participants.challenge_id
    AND group_members.user_id = auth.uid()
  )
);

-- Participants can leave (delete their own record)
CREATE POLICY "Participants can leave challenges"
ON challenge_participants FOR DELETE TO authenticated
USING (auth.uid() = user_id);


-- 9. Progress RLS
-- Participants can view progress of others in the challenge
CREATE POLICY "Group members can view progress"
ON challenge_progress FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_challenges
    JOIN group_members ON group_members.group_id = group_challenges.group_id
    WHERE group_challenges.id = challenge_progress.challenge_id
    AND group_members.user_id = auth.uid()
  )
);

-- Participants can log their own progress
CREATE POLICY "Participants can log progress"
ON challenge_progress FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM challenge_participants
    WHERE challenge_participants.challenge_id = challenge_progress.challenge_id
    AND challenge_participants.user_id = auth.uid()
  )
);

-- Participants can updated/delete their own logs
CREATE POLICY "Participants can update own logs"
ON challenge_progress FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Participants can delete own logs"
ON challenge_progress FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Force schema reload
NOTIFY pgrst, 'reload schema';
