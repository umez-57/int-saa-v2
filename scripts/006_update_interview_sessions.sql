-- Add questions_asked column to track asked questions
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS questions_asked TEXT[] DEFAULT '{}';

-- Add ended_at column to track when interview ended
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

-- Update RLS policies to allow users to read their own sessions
DROP POLICY IF EXISTS "Users can view own interview sessions" ON interview_sessions;
CREATE POLICY "Users can view own interview sessions" ON interview_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own interview sessions" ON interview_sessions;
CREATE POLICY "Users can update own interview sessions" ON interview_sessions
    FOR UPDATE USING (auth.uid() = user_id);
