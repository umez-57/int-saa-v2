-- Update interview sessions table to match current application structure
-- Add new columns and update existing ones

-- Add new columns
alter table public.interview_sessions 
add column if not exists persona text check (persona in ('hr', 'tech', 'behavioral')),
add column if not exists difficulty text check (difficulty in ('junior', 'mid', 'senior')),
add column if not exists mode text check (mode in ('5min', '10min', 'unlimited')),
add column if not exists miccheck_accuracy integer,
add column if not exists total_questions integer default 0,
add column if not exists completed_questions integer default 0,
add column if not exists average_score numeric(5,2),
add column if not exists tavus_conversation_id text,
add column if not exists tavus_conversation_url text;

-- Update session_type to be more flexible
alter table public.interview_sessions 
alter column session_type drop not null;

-- Create answers table for storing individual question responses
create table if not exists public.interview_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  question_number integer not null,
  question_text text not null,
  answer_transcript text,
  audio_url text,
  duration_ms integer,
  confidence_score numeric(3,2),
  evaluation jsonb,
  score integer,
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for answers table
alter table public.interview_answers enable row level security;

-- Create policies for answers table
create policy "answers_select_own"
  on public.interview_answers for select
  using (
    exists (
      select 1 from public.interview_sessions 
      where id = session_id and user_id = auth.uid()
    )
  );

create policy "answers_insert_own"
  on public.interview_answers for insert
  with check (
    exists (
      select 1 from public.interview_sessions 
      where id = session_id and user_id = auth.uid()
    )
  );

create policy "answers_update_own"
  on public.interview_answers for update
  using (
    exists (
      select 1 from public.interview_sessions 
      where id = session_id and user_id = auth.uid()
    )
  );

create policy "answers_delete_own"
  on public.interview_answers for delete
  using (
    exists (
      select 1 from public.interview_sessions 
      where id = session_id and user_id = auth.uid()
    )
  );

-- Create index for better performance
create index if not exists idx_interview_answers_session_id on public.interview_answers(session_id);
create index if not exists idx_interview_answers_question_number on public.interview_answers(session_id, question_number);
