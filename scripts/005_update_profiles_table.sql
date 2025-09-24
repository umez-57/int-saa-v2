-- Update profiles table to include onboarding fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_track TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS persona_pref TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS goals TEXT;

-- Add constraints for the new fields
ALTER TABLE profiles ADD CONSTRAINT check_experience_level 
  CHECK (experience_level IN ('Student', 'Fresher', '1-3y', '3-5y', '5+y'));

ALTER TABLE profiles ADD CONSTRAINT check_target_track 
  CHECK (target_track IN ('SDE-1', 'Applied-ML', 'Data', 'Product'));

ALTER TABLE profiles ADD CONSTRAINT check_persona_pref 
  CHECK (persona_pref IN ('HR', 'Tech', 'Behavioral'));
