/**
 * Answer Processing Service
 * 
 * Handles answer submission, evaluation, and summary generation
 * with the Python backend
 */

export interface AnswerSubmission {
  session_id: string
  question_number: number
  transcript_raw: string
  duration_ms: number
  audio_url?: string
  confidence_score?: number
}

export interface AnswerEvaluation {
  answer_id: string
  session_id: string
  question_number: number
  transcript: string
  duration_ms: number
  evaluation_score: number
  feedback: string
  strengths: string[]
  improvements: string[]
  keywords: string[]
  sentiment: string
  clarity_score: number
}

export interface InterviewSummary {
  session_id: string
  total_questions: number
  total_duration_ms: number
  overall_score: number
  answers: AnswerEvaluation[]
  summary_feedback: string
  recommendations: string[]
  strengths: string[]
  areas_for_improvement: string[]
}

/**
 * Submit an answer for evaluation
 */
export async function submitAnswer(submission: AnswerSubmission): Promise<{
  ok: boolean
  answer_id: string
  evaluation: AnswerEvaluation
  next_question_available: boolean
}> {
  console.log("[Answer] Submitting answer:", submission)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  
  try {
    const response = await fetch(`${backendUrl}/api/answers/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission),
    })

    if (!response.ok) {
      throw new Error(`Submission failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("[Answer] Submission successful:", result)
    return result
  } catch (error) {
    console.error("[Answer] Submission error:", error)
    throw error
  }
}

/**
 * Evaluate an answer
 */
export async function evaluateAnswer(
  transcript: string,
  questionNumber: number,
  durationMs: number,
  confidenceScore: number
): Promise<AnswerEvaluation> {
  console.log("[Answer] Evaluating answer:", { questionNumber, durationMs, confidenceScore })

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  
  try {
    const response = await fetch(`${backendUrl}/api/answers/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        question_number: questionNumber,
        duration_ms: durationMs,
        confidence_score: confidenceScore,
      }),
    })

    if (!response.ok) {
      throw new Error(`Evaluation failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("[Answer] Evaluation successful:", result)
    return result
  } catch (error) {
    console.error("[Answer] Evaluation error:", error)
    throw error
  }
}

/**
 * Generate interview summary
 */
export async function generateInterviewSummary(sessionId: string): Promise<InterviewSummary> {
  console.log("[Answer] Generating summary for session:", sessionId)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  
  try {
    const response = await fetch(`${backendUrl}/api/answers/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    })

    if (!response.ok) {
      throw new Error(`Summary generation failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("[Answer] Summary generation successful:", result)
    return result
  } catch (error) {
    console.error("[Answer] Summary generation error:", error)
    throw error
  }
}

/**
 * Get session answers
 */
export async function getSessionAnswers(sessionId: string): Promise<{
  ok: boolean
  session_id: string
  answers: Array<{
    question_number: number
    transcript: string
    score: number
    duration_ms: number
  }>
}> {
  console.log("[Answer] Fetching answers for session:", sessionId)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  
  try {
    const response = await fetch(`${backendUrl}/api/answers/session/${sessionId}/answers`)

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("[Answer] Fetch successful:", result)
    return result
  } catch (error) {
    console.error("[Answer] Fetch error:", error)
    throw error
  }
}

/**
 * Generate avatar feedback based on evaluation
 */
export function generateAvatarFeedback(evaluation: AnswerEvaluation): string {
  const score = evaluation.evaluation_score
  const sentiment = evaluation.sentiment
  
  if (score >= 90) {
    return "Excellent answer! You demonstrated strong understanding and clear communication."
  } else if (score >= 80) {
    return "Great job! Your answer was well-structured and informative."
  } else if (score >= 70) {
    return "Good answer! You covered the key points well."
  } else if (score >= 60) {
    return "Not bad! Consider adding more specific examples next time."
  } else {
    return "Let's work on providing more detailed answers. You can do better!"
  }
}

/**
 * Calculate overall interview performance metrics
 */
export function calculatePerformanceMetrics(summary: InterviewSummary): {
  average_score: number
  total_time_minutes: number
  words_per_minute: number
  clarity_average: number
  sentiment_distribution: Record<string, number>
} {
  const totalWords = summary.answers.reduce((sum, answer) => 
    sum + answer.transcript.split(' ').length, 0
  )
  
  const totalTimeMinutes = summary.total_duration_ms / (1000 * 60)
  const wordsPerMinute = totalTimeMinutes > 0 ? totalWords / totalTimeMinutes : 0
  
  const clarityAverage = summary.answers.reduce((sum, answer) => 
    sum + answer.clarity_score, 0
  ) / summary.answers.length
  
  const sentimentCounts = summary.answers.reduce((counts, answer) => {
    counts[answer.sentiment] = (counts[answer.sentiment] || 0) + 1
    return counts
  }, {} as Record<string, number>)
  
  return {
    average_score: summary.overall_score,
    total_time_minutes: totalTimeMinutes,
    words_per_minute: wordsPerMinute,
    clarity_average: clarityAverage,
    sentiment_distribution: sentimentCounts
  }
}
