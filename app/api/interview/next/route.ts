// app/api/interview/next/route.ts - Simplified frontend
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const nextQuestionSchema = z.object({
  session_id: z.string().min(1),
  last_answer_meta: z.object({
    question_number: z.number(),
    approved: z.boolean(),
  }).optional(),
  job_description: z.string().optional(),
  persona: z.string().optional(),
  difficulty: z.string().optional(),
  mode: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { session_id, last_answer_meta, job_description, persona, difficulty, mode } = nextQuestionSchema.parse(body)

    let session: any
    if (session_id.startsWith("demo-session")) {
      session = {
        persona: persona,
        difficulty: difficulty,
        mode: mode,
        questions_asked: []
      }
    } else {
      const { data: sessionData, error: sessionError } = await supabase
        .from("interview_sessions")
        .select("persona, difficulty, questions_asked, mode, description, session_type")
        .eq("id", session_id)
        .eq("user_id", user.id)
        .single()

      if (sessionError || !sessionData) {
        return NextResponse.json({ 
          error: "Interview session not found", 
          details: sessionError.message
        }, { status: 404 })
      }
      
      session = sessionData
    }

    const askedQuestionIds = session.questions_asked || []
    const finalJobDescription = job_description || session.description || session.job_description || ""

    // Call Python backend for question generation
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      // Choose backend endpoint by session type/persona
      let endpoint = "/questions/generate"
      const sType = (session as any).session_type as string | undefined
      if (sType === "core_cs" || sType === "coding") endpoint = "/questions/coding/generate"
      else if (sType === "system") endpoint = "/questions/system/generate"
      else if (sType === "mock" && session.persona === "tech") endpoint = "/questions/technical/generate"
      else if (sType === "mock" && session.persona === "hr") endpoint = "/questions/hr/generate"
      else if (sType === "mock" && session.persona === "behavioral") endpoint = "/questions/behavioral/generate"
      else endpoint = "/questions/mock/generate"
      const backendRequestUrl = `${backendUrl}${endpoint}`
      // Map mode to minutes for duration-aware prompts
      const modeToMinutes: Record<string, number | null> = {
        "1min": 1,
        "5min": 5,
        "10min": 10,
        "15min": 15,
        "30min": 30,
        "60min": 60,
        "unlimited": null,
      }

      const resolvedDifficulty = (session.difficulty || difficulty || 'mid')
      const resolvedMinutes = modeToMinutes[String(mode)] ?? null
      const backendRequestBody: any = {
        session_id,
        persona: (session.persona || persona || 'tech'),
        difficulty: resolvedDifficulty,
        question_number: askedQuestionIds.length + 1,
        context: askedQuestionIds.length > 0 ? `Previous questions asked: ${askedQuestionIds.length}` : undefined,
        job_description: finalJobDescription,
        mode,
        duration_minutes: resolvedMinutes,
      }
      
      console.log("[Interview] Backend request prepared", {
        endpoint: backendRequestUrl,
        session_id,
        resolvedDifficulty,
        resolvedMinutes,
        question_number: backendRequestBody.question_number,
      })
      
      const response = await fetch(backendRequestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendRequestBody)
      })
      
      if (response.ok) {
        const data = await response.json()
        const questionText = data.question
        const questionId = `backend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        console.log("[Interview] Generated question from backend:", questionText)
        
        // Update session with new question
        const updatedQuestionIds = [...askedQuestionIds, questionId]
        
        if (!session_id.startsWith("demo-session")) {
          const { error: updateError } = await supabase
            .from("interview_sessions")
            .update({
              questions_asked: updatedQuestionIds,
              updated_at: new Date().toISOString(),
            })
            .eq("id", session_id)
            
          if (updateError) {
            console.error("Failed to update session:", updateError)
          }
        }

        return NextResponse.json({
          ok: true,
          question: questionText,
          question_number: updatedQuestionIds.length,
        })
      } else {
        throw new Error(`Backend responded with status: ${response.status}`)
      }
    } catch (backendError: any) {
      console.error("[Interview] Backend generation failed:", backendError)
      return NextResponse.json({ 
        error: "Question generation failed", 
        details: backendError?.message || String(backendError) 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Next question error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}