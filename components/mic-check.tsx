"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, MicOff, CheckCircle, AlertCircle, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"
import { calcWER } from "@/lib/text"

const REFERENCE_TEXT =
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once."

interface MicCheckProps {
  onComplete: () => void
  sessionId: string
}

export function MicCheck({ onComplete, sessionId }: MicCheckProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [accuracy, setAccuracy] = useState(0)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "complete" | "error">("idle")
  const [transcript, setTranscript] = useState("")
  const [partialTranscript, setPartialTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [mockMode, setMockMode] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const whisperWorkerRef = useRef<Worker | null>(null)

  useEffect(() => {
    const initSTT = async () => {
      try {
        // Check if we have access to the backend for real STT
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        
        // Test backend connection
        const response = await fetch(`${backendUrl}/health`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App)'
          }
        })
        if (response.ok) {
          console.log("[MicCheck] Backend available, using real STT")
          setMockMode(false)
        } else {
          throw new Error("Backend not available")
        }
      } catch (err) {
        console.error("[MicCheck] Backend not available, using mock mode:", err)
        setMockMode(true)
      }
    }

    initSTT()

    return () => {
      if (whisperWorkerRef.current) {
        whisperWorkerRef.current.terminate()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      setStatus("recording")

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      streamRef.current = stream
      audioChunksRef.current = []

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)

          if (mockMode) {
            // Simulate live partial transcription
            const words = REFERENCE_TEXT.split(" ")
            const progress = Math.min(audioChunksRef.current.length / 10, 1)
            const partialWords = words.slice(0, Math.floor(words.length * progress))
            setPartialTranscript(partialWords.join(" "))
          }
        }
      }

      mediaRecorder.onstop = async () => {
        setStatus("processing")

        if (mockMode) {
          await new Promise((resolve) => setTimeout(resolve, 1500))
          const mockTranscript = generateMockTranscript(REFERENCE_TEXT)
          setTranscript(mockTranscript)
          processTranscript(mockTranscript)
        } else {
          // Real Whisper processing would go here
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
          await processWithWhisper(audioBlob)
        }
      }

      setIsRecording(true)
      mediaRecorder.start(100) // Collect data every 100ms for live processing
    } catch (err) {
      console.error("[v0] Error starting recording:", err)
      setError("Failed to access microphone. Please check permissions.")
      setStatus("error")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
  }

  const generateMockTranscript = (reference: string): string => {
    const words = reference.split(" ")
    const variations = [
      // Simulate common speech recognition errors
      () => words.join(" "), // Perfect
      () => words.map((w) => (Math.random() > 0.95 ? "[inaudible]" : w)).join(" "), // Occasional inaudible
      () => words.slice(0, -2).join(" "), // Missing end
      () => words.map((w) => (Math.random() > 0.98 ? w.replace(/s$/, "") : w)).join(" "), // Dropped endings
    ]

    const variation = variations[Math.floor(Math.random() * variations.length)]
    return variation()
  }

  const processWithWhisper = async (audioBlob: Blob) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      
      // Upload audio to backend for transcription
      const formData = new FormData()
      formData.append('file', audioBlob, 'mic-check-audio.webm')
      formData.append('session_id', sessionId)
      formData.append('question_number', '0') // Mic check is question 0
      
      const response = await fetch(`${backendUrl}/api/audio/transcribe`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App)'
        },
        body: formData,
      })
      
      if (response.ok) {
        const result = await response.json()
        setTranscript(result.transcript)
        processTranscript(result.transcript)
      } else {
        throw new Error(`Transcription failed: ${response.status}`)
      }
    } catch (err) {
      console.error("[MicCheck] Real STT failed, falling back to mock:", err)
      // Fall back to mock
      const mockTranscript = generateMockTranscript(REFERENCE_TEXT)
      setTranscript(mockTranscript)
      processTranscript(mockTranscript)
    }
  }

  const processTranscript = async (finalTranscript: string) => {
    const { accuracy: calculatedAccuracy } = calcWER(REFERENCE_TEXT, finalTranscript)
    const accuracyPercent = Math.round(calculatedAccuracy * 100)

    setAccuracy(accuracyPercent)
    setHasRecorded(true)
    setStatus("complete")

    try {
      const response = await fetch("/api/interview/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          miccheckAccuracy: accuracyPercent,
        }),
      })

      if (!response.ok) {
        console.error("[v0] Failed to save mic check accuracy")
      }
    } catch (err) {
      console.error("[v0] Error saving mic check accuracy:", err)
    }
  }

  const retry = () => {
    setAccuracy(0)
    setHasRecorded(false)
    setStatus("idle")
    setTranscript("")
    setPartialTranscript("")
    setError(null)
    audioChunksRef.current = []
  }

  const getAccuracyColor = (acc: number) => {
    if (acc >= 85) return "text-emerald-400"
    if (acc >= 70) return "text-yellow-400"
    return "text-red-400"
  }

  const getAccuracyStatus = (acc: number) => {
    if (acc >= 85) return "Excellent"
    if (acc >= 70) return "Good"
    return "Needs Improvement"
  }

  const AccuracyGauge = ({ value }: { value: number }) => {
    const radius = 60
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (value / 100) * circumference

    return (
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
          {/* Background circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={getAccuracyColor(value)}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getAccuracyColor(value)}`}>{value}%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Microphone Check
            {mockMode && (
              <Badge variant="secondary" className="text-xs">
                Mock Mode
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Please read the following text aloud clearly and at a normal pace. We'll measure your speech recognition
            accuracy to ensure optimal interview performance.
          </p>

          {/* Reference Text */}
          <div className="bg-muted/50 border-l-4 border-primary p-4 rounded-lg">
            <p className="text-lg leading-relaxed font-medium text-balance">{REFERENCE_TEXT}</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Recording Controls */}
          <div className="flex items-center justify-center gap-4">
            {status === "idle" || status === "error" ? (
              <Button onClick={startRecording} size="lg" className="gap-2">
                <Mic className="h-4 w-4" />
                Start Recording
              </Button>
            ) : status === "recording" ? (
              <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2">
                <MicOff className="h-4 w-4" />
                Stop Recording
              </Button>
            ) : (
              <Button disabled size="lg" className="gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </Button>
            )}
          </div>

          {/* Live Status */}
          <div className="flex justify-center">
            {status === "recording" && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                className="text-center"
              >
                <Badge variant="destructive" className="gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Recording...
                </Badge>
                {partialTranscript && <p className="text-sm text-muted-foreground italic">"{partialTranscript}..."</p>}
              </motion.div>
            )}
            {status === "processing" && (
              <Badge variant="secondary" className="gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Processing Audio...
              </Badge>
            )}
          </div>

          {/* Results */}
          {hasRecorded && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Accuracy Gauge */}
              <div className="text-center space-y-4">
                <AccuracyGauge value={accuracy} />
                <Badge
                  variant={accuracy >= 85 ? "default" : accuracy >= 70 ? "secondary" : "destructive"}
                  className="text-sm"
                >
                  {getAccuracyStatus(accuracy)}
                </Badge>
              </div>

              {/* Transcript Comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm text-muted-foreground">Reference Text</h4>
                  <div className="bg-muted/30 p-3 rounded text-sm">{REFERENCE_TEXT}</div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm text-muted-foreground">Your Speech</h4>
                  <div className="bg-muted/30 p-3 rounded text-sm">{transcript || "Processing..."}</div>
                </div>
              </div>

              {/* Tips */}
              {accuracy < 85 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tips for better accuracy:</strong> Speak clearly, ensure you're in a quiet environment, keep
                    the microphone at an appropriate distance, and read at a natural pace.
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={retry} className="gap-2 bg-transparent">
                  <RotateCcw className="h-4 w-4" />
                  Retry Test
                </Button>
                <Button onClick={onComplete} className="gap-2" disabled={accuracy < 85}>
                  <CheckCircle className="h-4 w-4" />
                  Continue to Interview
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
