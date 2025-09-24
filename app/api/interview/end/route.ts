// app/api/interview/end/route.ts
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const endSessionSchema = z.object({
  sessionId: z.string().min(1),
  finalScore: z.number().int().min(0).max(100).optional(),
  feedback: z.string().optional(),
  durationMinutes: z.number().int().min(0).optional(),
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
    const validatedData = endSessionSchema.parse(body)

    // Handle demo sessions differently
    if (validatedData.sessionId.startsWith("demo-session")) {
      return NextResponse.json({ 
        success: true, 
        session_id: validatedData.sessionId,
        message: "Demo session ended (not stored in database)"
      })
    }

    // Get session and calculate final statistics
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("id, user_id, status, completed_questions, start_time")
      .eq("id", validatedData.sessionId)
      .eq("user_id", user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 })
    }

    // Get all answers for this session to calculate average score
    const { data: answers, error: answersError } = await supabase
      .from("interview_answers")
      .select("score")
      .eq("session_id", validatedData.sessionId)
      .not("score", "is", null)

    let averageScore = null
    if (!answersError && answers && answers.length > 0) {
      const totalScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0)
      averageScore = Math.round(totalScore / answers.length)
    }

    // Update session with final data
    const updateData: any = {
      status: "completed",
      end_time: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (validatedData.finalScore !== undefined) {
      updateData.average_score = validatedData.finalScore
    } else if (averageScore !== null) {
      updateData.average_score = averageScore
    }

    if (validatedData.feedback) {
      // Store feedback in interview_feedback table
      await supabase
        .from("interview_feedback")
        .insert({
          session_id: validatedData.sessionId,
          overall_score: validatedData.finalScore || averageScore,
          strengths: "Overall good performance",
          weaknesses: "Areas for improvement identified",
          next_steps: "Continue practicing interview skills",
          created_at: new Date().toISOString(),
        })
    }

    const { data: updatedSession, error: updateError } = await supabase
      .from("interview_sessions")
      .update(updateData)
      .eq("id", validatedData.sessionId)
      .select("id, status, average_score, start_time, end_time, completed_questions")
      .single()

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json({ error: "Failed to end interview session" }, { status: 500 })
    }

    // Calculate final duration
    const durationMinutes = updatedSession.end_time && updatedSession.start_time 
      ? Math.round((new Date(updatedSession.end_time).getTime() - new Date(updatedSession.start_time).getTime()) / (1000 * 60))
      : 0

    return NextResponse.json({ 
      success: true, 
      session_id: updatedSession.id,
      status: updatedSession.status,
      final_score: updatedSession.average_score,
      duration_minutes: durationMinutes,
      completed_questions: updatedSession.completed_questions
    })

  } catch (error) {
    console.error("End session error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}