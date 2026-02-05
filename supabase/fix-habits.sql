-- ============================================
-- APPCOUNTABILITY DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 3: Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies for Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Step 5: Create RLS Policies for Habits
DROP POLICY IF EXISTS "Users can view their own habits" ON habits;
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can insert their own habits" ON habits;
CREATE POLICY "Users can insert their own habits"
  ON habits FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can update their own habits" ON habits;
CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can delete their own habits" ON habits;
CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING ( auth.uid() = user_id );

-- Step 6: Create RLS Policies for Habit Logs
DROP POLICY IF EXISTS "Users can view their own habit logs" ON habit_logs;
CREATE POLICY "Users can view their own habit logs"
  ON habit_logs FOR SELECT
  USING ( 
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own habit logs" ON habit_logs;
CREATE POLICY "Users can insert their own habit logs"
  ON habit_logs FOR INSERT
  WITH CHECK ( 
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own habit logs" ON habit_logs;
CREATE POLICY "Users can delete their own habit logs"
  ON habit_logs FOR DELETE
  USING ( 
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- Step 7: Backfill existing users (create profiles for users who signed up before the trigger)
INSERT INTO public.profiles (id, full_name, avatar_url)
SELECT 
  id,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
