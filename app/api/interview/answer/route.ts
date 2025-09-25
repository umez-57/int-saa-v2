// app/api/interview/answer/route.ts
import { createClient } from "@/lib/supabase/server"
import { getAzureOpenAIService } from "@/lib/azure-openai"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const answerSchema = z.object({
  sessionId: z.string().min(1),
  questionNumber: z.number().int().min(1),
  questionText: z.string().min(1),
  answerTranscript: z.string().optional(),
  audioUrl: z.string().optional(), // Remove URL validation to allow blob URLs
  durationMs: z.number().int().min(0).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  evaluation: z.record(z.any()).optional(),
  score: z.number().int().min(0).max(100).optional(),
  feedback: z.string().optional(),
  persona: z.string().optional(),
  difficulty: z.string().optional(),
  mode: z.string().optional(),
  jobDescription: z.string().optional(), // Add job description
  session_type: z.string().optional(), // Add session type
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
    const validatedData = answerSchema.parse(body)

    // Handle demo sessions differently
    if (validatedData.sessionId.startsWith("demo-session")) {
      return NextResponse.json({ 
        success: true, 
        answer_id: `demo-answer-${Date.now()}`,
        message: "Demo answer recorded (not stored in database)"
      })
    }

    // Generate strict evaluation using Azure OpenAI
    let evaluationResult = validatedData.evaluation || {}
    let finalScore = validatedData.score || 50
    let finalFeedback = validatedData.feedback || "No evaluation provided"

    if (validatedData.answerTranscript && validatedData.questionText) {
      try {
        console.log("[Evaluation] Calling backend evaluation service")
        console.log("[Evaluation] Data being sent:", {
          persona: validatedData.persona,
          difficulty: validatedData.difficulty,
          jobDescription: validatedData.jobDescription?.substring(0, 100) + "...",
          questionText: validatedData.questionText.substring(0, 100) + "...",
          answerLength: validatedData.answerTranscript.length
        })
        
        // Call the backend evaluation endpoint with detailed parameters
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
        const evaluationResponse = await fetch(`${backendUrl}/answers/evaluate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "User-Agent": "Mozilla/5.0 (compatible; NextJS-App)"
          },
          body: JSON.stringify({
            transcript: validatedData.answerTranscript,
            question_number: validatedData.questionNumber,
            duration_ms: validatedData.durationMs || 0,
            confidence_score: validatedData.confidenceScore || 0.8,
            difficulty: validatedData.difficulty || "medium",
            persona: validatedData.persona || "technical",
            job_description: validatedData.jobDescription || "",
            question_text: validatedData.questionText,
            session_type: validatedData.session_type || ""
          })
        })

        if (evaluationResponse.ok) {
          const evaluation = await evaluationResponse.json()
          
          evaluationResult = {
            score: evaluation.evaluation_score,
            feedback: evaluation.feedback,
            strengths: evaluation.strengths,
            improvements: evaluation.improvements,
            keywords: evaluation.keywords,
            sentiment: evaluation.sentiment,
            clarity_score: evaluation.clarity_score
          }
          
          finalScore = evaluation.evaluation_score
          finalFeedback = evaluation.feedback
          
          console.log("[Evaluation] Backend evaluation completed:", {
            score: finalScore,
            feedback: finalFeedback.substring(0, 100) + "..."
          })
        } else {
          const errorText = await evaluationResponse.text()
          console.error("[Evaluation] Backend error response:", errorText)
          throw new Error(`Backend evaluation failed: ${evaluationResponse.status} - ${errorText}`)
        }
        
      } catch (error) {
        console.error("[Evaluation] Failed to call backend evaluation, using strict fallback:", error)
        
        // Strict fallback evaluation
        const answerLength = validatedData.answerTranscript.length
        const duration = validatedData.durationMs || 0
        
        // VERY strict scoring - "I don't know" answers get 0-5 points
        let strictScore = 0 // Start at 0
        
        // Check for "I don't know" type answers with more comprehensive detection
        const answerText = validatedData.answerTranscript.toLowerCase()
        const noKnowledgePhrases = [
          "i don't know", "i can't", "i'm not fit", "i never faced", 
          "i'm not particularly fit", "i don't know what is", "i never been",
          "i have no clue", "i've no clue", "no clue", "i don't have any idea",
          "i have no idea", "i've no idea", "no idea", "i'm not sure",
          "i'm not familiar", "i'm not experienced", "i'm new to this",
          "i don't have experience", "i haven't worked", "i never worked",
          "i'm not good at", "i can't answer", "i cannot answer",
          "i don't understand", "i'm confused", "i'm lost",
          "i don't have knowledge", "i lack knowledge", "i'm not knowledgeable",
          "i'm not qualified", "i'm not capable", "i'm not able",
          "i'm not skilled", "i'm not trained", "i'm not prepared",
          "i'm not ready", "i'm not equipped", "i'm not competent"
        ]
        
        // Check if answer is just repeating the question
        const questionText = validatedData.questionText.toLowerCase()
        const answerWords = answerText.split(/\s+/).filter(word => word.length > 3)
        const questionWords = questionText.split(/\s+/).filter(word => word.length > 3)
        
        // Calculate similarity between answer and question
        const commonWords = answerWords.filter(word => questionWords.includes(word))
        const similarityRatio = commonWords.length / Math.max(answerWords.length, 1)
        
        // If more than 60% of words are from the question, it's likely just repetition
        const isQuestionRepetition = similarityRatio > 0.6 && answerWords.length > 10
        
        const hasNoKnowledge = noKnowledgePhrases.some(phrase => answerText.includes(phrase))
        
        // Check for very short answers (less than 20 words)
        const isVeryShort = answerWords.length < 20
        
        if (hasNoKnowledge || isQuestionRepetition || isVeryShort) {
          strictScore = 0 // "I don't know", repetition, or very short answers get 0 points
        } else {
          // Only give points if they actually try to answer with original content
          if (answerLength > 20) strictScore += 5
          if (answerLength > 50) strictScore += 10
          if (answerLength > 100) strictScore += 15
          if (answerLength > 200) strictScore += 20
          if (duration > 15000) strictScore += 5 // 15+ seconds
          if (duration > 30000) strictScore += 5 // 30+ seconds
          
          // Cap at 30 for fallback (much lower)
          strictScore = Math.min(strictScore, 30)
        }
        
        // Determine the type of poor answer for specific feedback
        let feedbackMessage = ""
        let improvements = []
        
        if (hasNoKnowledge) {
          feedbackMessage = `FAILED: You said you don't know or can't answer. This is not acceptable in an interview. You must attempt to answer every question, even if you're unsure. Try to think through the problem step by step and provide your best attempt. Score: ${strictScore}/100.`
          improvements = ["Never say 'I don't know' in an interview", "Always attempt to answer", "Think through the problem step by step", "Provide your best attempt even if unsure"]
        } else if (isQuestionRepetition) {
          feedbackMessage = `FAILED: You just repeated the question instead of answering it. This shows no effort to provide an actual answer. You must give your own response, not just repeat what was asked. Score: ${strictScore}/100.`
          improvements = ["Don't repeat the question", "Provide your own original answer", "Think about what you know about the topic", "Give specific examples from your experience"]
        } else if (isVeryShort) {
          feedbackMessage = `FAILED: Your answer is too short (${answerWords.length} words). This shows insufficient effort. You need to provide a detailed, thoughtful response. Score: ${strictScore}/100.`
          improvements = ["Provide much more detailed answer", "Explain your thought process", "Give specific examples", "Address all parts of the question"]
        } else {
          feedbackMessage = `Strict fallback evaluation: Answer length ${answerLength} chars, duration ${Math.round(duration/1000)}s. Score: ${strictScore}/100. Please provide much more detailed answers with specific examples.`
          improvements = answerLength < 100 
            ? ["Provide much more detailed answer", "Use specific examples", "Address the question directly", "Explain your thought process"]
            : ["Could be more specific", "Add more examples", "Provide more technical details"]
        }
        
        evaluationResult = {
          score: strictScore,
          feedback: feedbackMessage,
          strengths: answerLength > 100 && !hasNoKnowledge && !isQuestionRepetition ? ["Provided some detail"] : [],
          improvements: improvements,
          keywords: [],
          sentiment: "negative",
          clarity_score: (hasNoKnowledge || isQuestionRepetition || isVeryShort) ? 0.1 : 0.3
        }
        
        finalScore = strictScore
        finalFeedback = evaluationResult.feedback
      }
    }

    // Verify session exists and belongs to user
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("id, user_id, status, completed_questions")
      .eq("id", validatedData.sessionId)
      .eq("user_id", user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 })
    }

    // Insert answer
    const { data: answer, error: insertError } = await supabase
      .from("interview_answers")
      .insert({
        session_id: validatedData.sessionId,
        question_number: validatedData.questionNumber,
        question_text: validatedData.questionText,
        answer_transcript: validatedData.answerTranscript,
        transcript_raw: validatedData.answerTranscript, // Store as both
        audio_url: validatedData.audioUrl,
        duration_ms: validatedData.durationMs,
        confidence_score: validatedData.confidenceScore,
        evaluation: evaluationResult,
        score: finalScore,
        feedback: finalFeedback,
        created_at: new Date().toISOString(),
      })
      .select("id, question_number, score, created_at")
      .single()

    if (insertError) {
      console.error("Database insert error:", insertError)
      return NextResponse.json({ error: "Failed to save answer" }, { status: 500 })
    }

    // Update session statistics
    const { error: updateError } = await supabase
      .from("interview_sessions")
      .update({
        completed_questions: validatedData.questionNumber,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedData.sessionId)

    if (updateError) {
      console.error("Failed to update session statistics:", updateError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ 
      success: true, 
      answer_id: answer.id,
      question_number: answer.question_number,
      score: answer.score,
      created_at: answer.created_at
    })

  } catch (error) {
    console.error("Answer submission error:", error)

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
        answers: [],
        message: "Demo session - no stored answers"
      })
    }

    // Get answers for session
    const { data: answers, error: fetchError } = await supabase
      .from("interview_answers")
      .select("*")
      .eq("session_id", sessionId)
      .order("question_number", { ascending: true })

    if (fetchError) {
      console.error("Database fetch error:", fetchError)
      return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 })
    }

    return NextResponse.json({ answers: answers || [] })

  } catch (error) {
    console.error("Answer fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}