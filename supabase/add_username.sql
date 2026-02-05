-- Add username column if it doesn't exist
alter table public.profiles 
add column if not exists username text unique;

-- Ensure full_name and avatar_url exist (should already be there from schema.sql inspection, but good to be safe)
alter table public.profiles 
add column if not exists full_name text;

alter table public.profiles 
add column if not exists avatar_url text;

-- Add comment
comment on column public.profiles.username is 'Unique username for the user';
