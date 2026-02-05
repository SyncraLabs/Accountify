-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (Profiles) - synced with auth.users usually via trigger
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  bio text,
  context text,
  current_streak int default 0,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Groups
create table if not exists public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  theme text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habits
create table if not exists public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  category text, 
  frequency text not null,
  description text,
  streak int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habit Logs (for calendar/heatmap)
create table if not exists public.habit_logs (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  completed_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, completed_date)
);

-- Group Members
create table if not exists public.group_members (
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (group_id, user_id)
);

-- Chat Messages
create table if not exists public.group_messages (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null, 
  content text not null,
  is_ai_generated boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.group_members enable row level security;
alter table public.group_messages enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Habits policies
create policy "Users can view their own habits"
  on habits for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own habits"
  on habits for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own habits"
  on habits for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own habits"
  on habits for delete
  using ( auth.uid() = user_id );

-- Habit logs policies
create policy "Users can view their own habit logs"
  on habit_logs for select
  using ( 
    exists (
      select 1 from habits
      where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
    )
  );

create policy "Users can insert their own habit logs"
  on habit_logs for insert
  with check ( 
    exists (
      select 1 from habits
      where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
    )
  );

create policy "Users can delete their own habit logs"
  on habit_logs for delete
  using ( 
    exists (
      select 1 from habits
      where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
    )
  );
