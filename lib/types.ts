export type Mode = "1min" | "5min" | "10min" | "15min" | "30min" | "60min" | "unlimited"
export type Difficulty = "Easy" | "Medium" | "Hard"
export type Persona = "HR" | "Tech" | "Behavioral"

export type Session = {
  id: string
  persona: Persona
  difficulty: Difficulty
  mode: Mode
  started_at: string
  ended_at?: string
  miccheck_accuracy?: number
}

export type InterviewPhase = "asking" | "listening" | "finalizing" | "reviewing"

export interface Question {
  id: string
  text: string
  followUp?: string
  category: string
}

export interface Answer {
  id: string
  session_id: string
  question_id: string
  question_text: string
  transcript: string
  audio_url?: string
  duration_seconds: number
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  full_name: string
  email: string
  experience_level: string
  target_role: string
  preferred_interview_length: string
  areas_of_focus: string[]
  created_at: string
  updated_at: string
}
