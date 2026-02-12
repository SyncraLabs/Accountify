-- Add subscription fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS ai_coach_uses_this_month integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_coach_reset_date date;

-- Add index on stripe_customer_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
  ON public.profiles (stripe_customer_id) 
  WHERE stripe_customer_id IS NOT NULL;

-- Add check constraint for valid tiers
ALTER TABLE public.profiles
  ADD CONSTRAINT valid_subscription_tier 
  CHECK (subscription_tier IN ('free', 'pro', 'leader'));
