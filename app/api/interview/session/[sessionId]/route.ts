import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const { job_description } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Update session with job description
    const { error: updateError } = await supabase
      .from("interview_sessions")
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq("id", sessionId)
      .eq("user_id", user.id)

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json(
        { error: "Failed to update session" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: "Session updated successfully" 
    })

  } catch (error) {
    console.error("[Session Update] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
