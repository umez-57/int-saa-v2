// app/api/interview/session/route.ts - Fixed with correct column names
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const sessionSchema = z.object({
  persona: z.enum(["hr", "tech", "behavioral"]).optional(),
  difficulty: z.enum(["junior", "mid", "senior"]).optional(),
  mode: z.enum(["1min", "5min", "10min", "15min", "30min", "60min", "unlimited"]),
  title: z.string().optional(),
  description: z.string().optional(), // This will store the job description
  jobDescription: z.string().optional(), // Keep for backward compatibility
  session_type: z.enum(["mock", "coding", "system", "core_cs"]).optional(),
})

const updateSessionSchema = z.object({
  sessionId: z.string().min(1),
  miccheckAccuracy: z.number().min(0).max(100).optional(),
  job_description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = sessionSchema.parse(body)

    // Use jobDescription if provided, otherwise use description
    let jobDescription = validatedData.jobDescription || validatedData.description || null

    // Resolve defaults for persona/difficulty when omitted (coding/system flows)
    const resolvedPersona = validatedData.persona || (validatedData.session_type === "coding" ? "tech" : validatedData.session_type === "system" ? "tech" : "tech")
    const resolvedDifficulty = validatedData.difficulty || (validatedData.session_type === "coding" ? ("mid") : validatedData.session_type === "system" ? ("mid") : "mid")

    // Title fallback
    const fallbackTitle = validatedData.session_type === "coding"
      ? `CODING Practice - ${resolvedDifficulty.toUpperCase()}`
      : validatedData.session_type === "system"
        ? `SYSTEM DESIGN - ${validatedData.mode}`
        : `${resolvedPersona.toUpperCase()} Interview - ${resolvedDifficulty.toUpperCase()}`

    // Insert new interview session
    const { data: session, error: insertError } = await supabase
      .from("interview_sessions")
      .insert({
        user_id: user.id,
        persona: resolvedPersona,
        difficulty: resolvedDifficulty,
        mode: validatedData.mode,
        session_type: validatedData.session_type || "mock",
        title: validatedData.title || fallbackTitle,
        description: jobDescription, // Maintain for backward compat
        job_description: jobDescription, // Ensure InterviewRoom gets it directly
        status: "in_progress",
        start_time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, persona, difficulty, mode, status, title, description")
      .single()

    if (insertError) {
      console.error("Database insert error:", insertError)
      return NextResponse.json({ error: "Failed to create interview session" }, { status: 500 })
    }

    // For HR interviews, redirect to resume upload page
    if (session.persona === "hr") {
      return NextResponse.json({ 
        session_id: session.id,
        persona: session.persona,
        difficulty: session.difficulty,
        mode: session.mode,
        status: session.status,
        title: session.title,
        description: session.description,
        job_description: session.description,
        redirect_to_upload: true
      })
    }

    return NextResponse.json({ 
      session_id: session.id,
      persona: session.persona,
      difficulty: session.difficulty,
      mode: session.mode,
      status: session.status,
      title: session.title,
      description: session.description,
      job_description: session.description // Map description to job_description for frontend
    })
  } catch (error) {
    console.error("Session creation error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateSessionSchema.parse(body)

    // Handle demo sessions differently
    if (validatedData.sessionId.startsWith("demo-session")) {
      return NextResponse.json({ success: true, session_id: validatedData.sessionId })
    }

    // Update interview session
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }
    
    if (validatedData.miccheckAccuracy !== undefined) {
      updateData.miccheck_accuracy = validatedData.miccheckAccuracy
    }
    
    if (validatedData.job_description !== undefined) {
      updateData.description = validatedData.job_description // Update description column
    }

    const { data: session, error: updateError } = await supabase
      .from("interview_sessions")
      .update(updateData)
      .eq("id", validatedData.sessionId)
      .eq("user_id", user.id)
      .select("id")
      .single()

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json({ error: "Failed to update interview session" }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({ success: true, session_id: session.id })
  } catch (error) {
    console.error("Session update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Handle demo sessions
    if (sessionId.startsWith("demo-session")) {
      return NextResponse.json({
        session_id: sessionId,
        persona: "tech",
        difficulty: "mid",
        mode: "10min",
        status: "completed",
        total_questions: 3,
        completed_questions: 3,
        average_score: 85,
        duration_minutes: 8,
        created_at: new Date().toISOString()
      })
    }

    // Get session data
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 })
    }

    // Calculate duration in minutes
    const durationMinutes = session.end_time && session.start_time 
      ? Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60))
      : 0

    return NextResponse.json({
      ...session,
      duration_minutes: durationMinutes,
      job_description: session.description // Map description to job_description for frontend
    })

  } catch (error) {
    console.error("Session fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}