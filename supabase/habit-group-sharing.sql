-- Habit Group Sharing Schema
-- Enables users to share habits with groups and view group members' progress

-- Table: habit_group_shares
-- Tracks which habits are shared with which groups
CREATE TABLE IF NOT EXISTS public.habit_group_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    auto_share BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(habit_id, group_id)
);

-- Table: user_onboarding_flags
-- Tracks onboarding completion states per user
CREATE TABLE IF NOT EXISTS public.user_onboarding_flags (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    groups_intro_completed BOOLEAN DEFAULT false,
    groups_intro_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.habit_group_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habit_group_shares

-- Users can view their own habit shares
CREATE POLICY "Users can view own habit shares"
ON public.habit_group_shares FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own habit shares
CREATE POLICY "Users can create own habit shares"
ON public.habit_group_shares FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own habit shares
CREATE POLICY "Users can update own habit shares"
ON public.habit_group_shares FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own habit shares
CREATE POLICY "Users can delete own habit shares"
ON public.habit_group_shares FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Group members can view shared habits in their groups
CREATE POLICY "Group members can view shared habits in group"
ON public.habit_group_shares FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_members.group_id = habit_group_shares.group_id
        AND group_members.user_id = auth.uid()
    )
);

-- RLS Policies for user_onboarding_flags

-- Users can view their own onboarding flags
CREATE POLICY "Users can view own onboarding flags"
ON public.user_onboarding_flags FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own onboarding flags
CREATE POLICY "Users can create own onboarding flags"
ON public.user_onboarding_flags FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own onboarding flags
CREATE POLICY "Users can update own onboarding flags"
ON public.user_onboarding_flags FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Extended RLS Policies for habits table
-- Allow group members to view habits shared with their groups
CREATE POLICY "Group members can view shared habits"
ON public.habits FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.habit_group_shares hgs
        JOIN public.group_members gm ON gm.group_id = hgs.group_id
        WHERE hgs.habit_id = habits.id
        AND gm.user_id = auth.uid()
    )
);

-- Extended RLS Policies for habit_logs table
-- Allow group members to view logs of shared habits
CREATE POLICY "Group members can view shared habit logs"
ON public.habit_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.habits
        WHERE habits.id = habit_logs.habit_id
        AND habits.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.habit_group_shares hgs
        JOIN public.group_members gm ON gm.group_id = hgs.group_id
        WHERE hgs.habit_id = habit_logs.habit_id
        AND gm.user_id = auth.uid()
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_habit_group_shares_habit_id ON public.habit_group_shares(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_group_shares_group_id ON public.habit_group_shares(group_id);
CREATE INDEX IF NOT EXISTS idx_habit_group_shares_user_id ON public.habit_group_shares(user_id);
