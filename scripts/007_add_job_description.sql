-- Add job_description column to interview_sessions table
ALTER TABLE public.interview_sessions 
ADD COLUMN IF NOT EXISTS job_description TEXT;






