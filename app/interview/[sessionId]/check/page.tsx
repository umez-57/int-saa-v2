import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { MicCheck } from "@/components/mic-check"

export default async function MicCheckPage({ params }: { params: { sessionId: string } }) {
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

  const handleComplete = () => {
    // Navigate to interview room
    window.location.href = `/interview/${params.sessionId}`
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 md:px-8 py-8">
        <MicCheck onComplete={handleComplete} sessionId={params.sessionId} />
      </div>
    </div>
  )
}
