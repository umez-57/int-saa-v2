/**
 * Audio Processing Service
 * 
 * Handles audio recording, transcription, and processing integration
 * with the Python backend and Azure services
 */

export interface AudioProcessingResult {
  transcript: string
  confidence: number
  duration_ms: number
  word_count: number
  analysis?: {
    clarity_score: number
    sentiment: string
    keywords: string[]
  }
}

export interface AudioUploadResult {
  file_url: string
  file_size: number
}

/**
 * Upload audio file to backend for processing
 */
export async function uploadAudioFile(
  audioBlob: Blob,
  sessionId: string,
  questionNumber: number
): Promise<AudioUploadResult> {
  console.log("[Audio] Uploading audio file:", { sessionId, questionNumber })

  const formData = new FormData()
  formData.append('file', audioBlob, `interview-${sessionId}-q${questionNumber}.wav`)
  formData.append('session_id', sessionId)
  formData.append('question_number', questionNumber.toString())

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  
  try {
    const response = await fetch(`${backendUrl}/api/audio/upload`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App)'
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("[Audio] Upload successful:", result)
    return result
  } catch (error) {
    console.error("[Audio] Upload error:", error)
    throw error
  }
}

/**
 * Process audio: transcribe and analyze
 */
export async function processAudio(
  sessionId: string,
  questionNumber: number,
  audioUrl: string
): Promise<AudioProcessingResult> {
  console.log("[Audio] Processing audio:", { sessionId, questionNumber, audioUrl })

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  
  try {
    const response = await fetch(`${backendUrl}/api/audio/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App)'
      },
      body: JSON.stringify({
        session_id: sessionId,
        question_number: questionNumber,
        audio_url: audioUrl,
      }),
    })

    if (!response.ok) {
      throw new Error(`Processing failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("[Audio] Processing successful:", result)
    return result
  } catch (error) {
    console.error("[Audio] Processing error:", error)
    throw error
  }
}

/**
 * Transcribe audio using backend service
 */
export async function transcribeAudio(
  audioUrl: string,
  sessionId: string,
  questionNumber: number
): Promise<AudioProcessingResult> {
  console.log("[Audio] Transcribing audio:", { audioUrl, sessionId, questionNumber })

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  
  try {
    const response = await fetch(`${backendUrl}/api/audio/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App)'
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        session_id: sessionId,
        question_number: questionNumber,
      }),
    })

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("[Audio] Transcription successful:", result)
    return result
  } catch (error) {
    console.error("[Audio] Transcription error:", error)
    throw error
  }
}

/**
 * Calculate Word Error Rate (WER) between expected and actual text
 */
export function calculateWER(expected: string, actual: string): number {
  const expectedWords = expected.toLowerCase().split(/\s+/)
  const actualWords = actual.toLowerCase().split(/\s+/)
  
  // Simple WER calculation (can be enhanced with more sophisticated algorithms)
  const maxLength = Math.max(expectedWords.length, actualWords.length)
  if (maxLength === 0) return 0
  
  let errors = 0
  const minLength = Math.min(expectedWords.length, actualWords.length)
  
  for (let i = 0; i < minLength; i++) {
    if (expectedWords[i] !== actualWords[i]) {
      errors++
    }
  }
  
  errors += Math.abs(expectedWords.length - actualWords.length)
  
  return errors / maxLength
}

/**
 * Analyze audio quality metrics
 */
export function analyzeAudioQuality(
  duration: number,
  wordCount: number,
  confidence: number
): {
  quality_score: number
  feedback: string
} {
  let qualityScore = 0
  let feedback = ""

  // Duration analysis
  if (duration < 5000) {
    qualityScore += 0.2
    feedback += "Consider providing more detailed answers. "
  } else if (duration > 60000) {
    qualityScore += 0.3
    feedback += "Good detailed response. "
  } else {
    qualityScore += 0.4
    feedback += "Appropriate response length. "
  }

  // Word count analysis
  if (wordCount < 20) {
    qualityScore += 0.1
    feedback += "Try to elaborate more on your points. "
  } else if (wordCount > 100) {
    qualityScore += 0.3
    feedback += "Comprehensive answer. "
  } else {
    qualityScore += 0.4
    feedback += "Good balance of detail. "
  }

  // Confidence analysis
  if (confidence > 0.9) {
    qualityScore += 0.3
    feedback += "Clear speech quality. "
  } else if (confidence > 0.7) {
    qualityScore += 0.2
    feedback += "Good speech clarity. "
  } else {
    qualityScore += 0.1
    feedback += "Consider speaking more clearly. "
  }

  return {
    quality_score: Math.min(1.0, qualityScore),
    feedback: feedback.trim()
  }
}
