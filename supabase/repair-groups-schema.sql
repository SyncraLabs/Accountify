-- Groups Table Repair Script
-- This script safely checks for missing columns and adds them if they don't exist.

DO $$
BEGIN
    -- 1. Ensure 'created_by' exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'created_by') THEN
        ALTER TABLE groups ADD COLUMN created_by uuid REFERENCES auth.users(id);
    END IF;

    -- 2. Ensure 'avatar_url' exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'avatar_url') THEN
        ALTER TABLE groups ADD COLUMN avatar_url text;
    END IF;

    -- 3. Ensure 'invite_code' exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'invite_code') THEN
        ALTER TABLE groups ADD COLUMN invite_code text UNIQUE;
    END IF;

    -- 4. Ensure 'description' exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'description') THEN
        ALTER TABLE groups ADD COLUMN description text;
    END IF;

END $$;

-- Force schema reload to pick up changes
NOTIFY pgrst, 'reload schema';
