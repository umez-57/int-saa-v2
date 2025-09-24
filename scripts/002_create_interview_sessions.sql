-- Create interview sessions table
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_type text not null check (session_type in ('coding', 'system_design', 'behavioral')),
  title text not null,
  description text,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'paused')),
  score integer,
  feedback text,
  duration_minutes integer,
  audio_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.interview_sessions enable row level security;

-- Create policies
create policy "sessions_select_own"
  on public.interview_sessions for select
  using (auth.uid() = user_id);

create policy "sessions_insert_own"
  on public.interview_sessions for insert
  with check (auth.uid() = user_id);

create policy "sessions_update_own"
  on public.interview_sessions for update
  using (auth.uid() = user_id);

create policy "sessions_delete_own"
  on public.interview_sessions for delete
  using (auth.uid() = user_id);
