-- ============================================
-- ENABLE ROUTINES & UPDATE SCHEMA
-- ============================================

-- 1. Create routines table
CREATE TABLE IF NOT EXISTS public.routines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add foreign key to habits table
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE;

-- 3. Enable RLS on routines
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for routines
DROP POLICY IF EXISTS "Users can view their own routines" ON routines;
DROP POLICY IF EXISTS "Users can insert their own routines" ON routines;
DROP POLICY IF EXISTS "Users can delete their own routines" ON routines;

CREATE POLICY "Users can view their own routines"
  ON routines FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own routines"
  ON routines FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own routines"
  ON routines FOR DELETE
  USING ( auth.uid() = user_id );
