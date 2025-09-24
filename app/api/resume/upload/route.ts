import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const uploadSchema = z.object({
  session_id: z.string().min(1),
  resume_text: z.string().min(10),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { session_id, resume_text } = uploadSchema.parse(body)

    // Update the interview session with resume text
    const { error: updateError } = await supabase
      .from("interview_sessions")
      .update({
        resume_text: resume_text,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session_id)
      .eq("user_id", user.id)

    if (updateError) {
      return NextResponse.json({ 
        error: "Failed to save resume", 
        details: updateError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: "Resume processed successfully"
    })

  } catch (error) {
    console.error("Resume upload error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

