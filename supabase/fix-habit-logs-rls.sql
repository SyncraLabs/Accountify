-- ============================================
-- FIX RLS POLICIES FOR HABIT LOGS
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop existing habit_logs policies
DROP POLICY IF EXISTS "Users can view their own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users can insert their own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users can delete their own habit logs" ON habit_logs;

-- Step 2: Create new policies for habit_logs
CREATE POLICY "Users can view their own habit logs"
  ON habit_logs FOR SELECT
  USING ( 
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own habit logs"
  ON habit_logs FOR INSERT
  WITH CHECK ( 
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own habit logs"
  ON habit_logs FOR DELETE
  USING ( 
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- Step 3: Ensure RLS is enabled on habit_logs
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- Step 4: Test query
SELECT * FROM habit_logs 
WHERE habit_id IN (
  SELECT id FROM habits WHERE user_id = auth.uid()
);
