-- ============================================
-- FIX RLS POLICIES FOR HABITS
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own habits" ON habits;
DROP POLICY IF EXISTS "Users can insert their own habits" ON habits;
DROP POLICY IF EXISTS "Users can update their own habits" ON habits;
DROP POLICY IF EXISTS "Users can delete their own habits" ON habits;

-- Step 2: Create new, working policies
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own habits"
  ON habits FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING ( auth.uid() = user_id );

-- Step 3: Verify RLS is enabled
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Step 4: Test by selecting from habits (should work now)
SELECT * FROM habits WHERE user_id = auth.uid();
