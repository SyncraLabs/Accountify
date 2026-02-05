-- Ensure 'groups' table exists and has 'avatar_url'
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'avatar_url') THEN
        ALTER TABLE groups ADD COLUMN avatar_url text;
    END IF;
END $$;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
