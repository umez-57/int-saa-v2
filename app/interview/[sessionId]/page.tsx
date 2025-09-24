import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { InterviewRoom } from "@/components/interview-room"

export default async function InterviewRoomPage({ params }: { params: { sessionId: string } }) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/")
  }

  // Check if user has completed onboarding
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profileError || !profile) {
    redirect("/onboarding")
  }

  const { data: session, error: sessionError } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("id", params.sessionId)
    .eq("user_id", user.id)
    .single()

  if (sessionError || !session) {
    redirect("/dashboard")
  }

  return <InterviewRoom session={session} />
}
