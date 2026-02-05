-- Add columns to messages table to support habit sharing
ALTER TABLE messages ADD COLUMN IF NOT EXISTS habit_id UUID REFERENCES habits(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS habit_title TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS habit_streak INTEGER;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS habit_category TEXT;
