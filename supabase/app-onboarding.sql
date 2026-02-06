-- App Onboarding Schema Extension
-- Adds app-wide onboarding tracking to user_onboarding_flags table

-- Add app intro columns to existing table
ALTER TABLE public.user_onboarding_flags
ADD COLUMN IF NOT EXISTS app_intro_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS app_intro_completed_at TIMESTAMP WITH TIME ZONE;
