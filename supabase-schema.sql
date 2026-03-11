-- ╔══════════════════════════════════════════════════════╗
-- ║        HabitFlow — Updated Supabase Schema            ║
-- ╚══════════════════════════════════════════════════════╝

-- 1. PROFILES TABLE (User settings & Communication)
create table if not exists profiles (
  id           uuid references auth.users on delete cascade primary key,
  full_name    text,
  phone_number text,      -- For WhatsApp/SMS
  callmebot_apikey text,  -- API Key from CallMeBot (WhatsApp)
  whatsapp_reminder boolean default false,
  email_report      boolean default true,
  reminder_time     time    default '20:00:00',
  created_at   timestamptz default now()
);

-- 2. HABITS TABLE (Updated with Target Days)
create table if not exists habits (
  id          uuid    default gen_random_uuid() primary key,
  user_id     uuid    references auth.users on delete cascade not null,
  name        text    not null,
  description text,
  color       text    default '#C4866A',
  emoji       text    default '✅',
  target_days int     default 7, -- How many days per week is the goal?
  created_at  timestamptz default now()
);

-- 3. HABIT LOGS TABLE
create table if not exists habit_logs (
  id         uuid    default gen_random_uuid() primary key,
  user_id    uuid    references auth.users on delete cascade not null,
  habit_id   uuid    references habits on delete cascade not null,
  date       date    not null,
  completed  boolean default true,
  created_at timestamptz default now(),
  unique(user_id, habit_id, date)
);

-- 4. INDEXES
create index if not exists idx_habits_user     on habits(user_id);
create index if not exists idx_logs_user_date  on habit_logs(user_id, date);
create index if not exists idx_logs_habit      on habit_logs(habit_id);
create index if not exists idx_profiles_user   on profiles(id);

-- 5. RLS
alter table profiles   enable row level security;
alter table habits     enable row level security;
alter table habit_logs  enable row level security;

-- Policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can view own habits" on habits for select using (auth.uid() = user_id);
create policy "Users can insert own habits" on habits for insert with check (auth.uid() = user_id);
create policy "Users can update own habits" on habits for update using (auth.uid() = user_id);
create policy "Users can delete own habits" on habits for delete using (auth.uid() = user_id);

create policy "Users can view own logs" on habit_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on habit_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own logs" on habit_logs for update using (auth.uid() = user_id);
create policy "Users can delete own logs" on habit_logs for delete using (auth.uid() = user_id);

-- 6. TRIGGER FOR NEW USER PROFILE
-- Create a profile automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
