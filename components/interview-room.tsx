// components/interview-room.tsx - Fixed API parameter names
"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useInterviewStore } from "@/lib/store"
import { useAzureSpeech } from "@/hooks/use-azure-speech"
import { useAudioTranscription } from "@/hooks/use-audio-transcription"
import { TavusAvatar } from "@/components/tavus-avatar"
import { DailyMinimal } from "@/components/daily-minimal"
import { TimerBadge } from "@/components/timer-badge"
import { TranscriptPanel } from "@/components/transcript-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  X, 
  Square, 
  RotateCcw, 
  Mic, 
  Send,
  FileText,
  ArrowRight,
  GripVertical,
  CheckCircle,
  ArrowLeft
} from "lucide-react"
import { motion } from "framer-motion"
import { HR_SCREENING_JD, BEHAVIORAL_JD } from "@/lib/default-jds"

interface InterviewRoomProps {
  session: {
    id: string
    persona: "hr" | "tech" | "behavioral"
    difficulty: "junior" | "mid" | "senior"
    mode: "1min" | "5min" | "10min" | "15min" | "30min" | "60min" | "unlimited"
    status: string
    job_description?: string
    resume_text?: string
  }
}

export function InterviewRoom({ session }: InterviewRoomProps) {
  const router = useRouter()
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingStartTimeRef = useRef<number>(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null)
  const [manualTranscript, setManualTranscript] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)
  const [jobDescription, setJobDescription] = useState(session.job_description || "")
  const [hasJobDescription, setHasJobDescription] = useState(!!session.job_description)
  const [isWaitingForJobDescription, setIsWaitingForJobDescription] = useState(!session.job_description)
  const [leftPanelWidth, setLeftPanelWidth] = useState(320)
  const [showContinueEndDialog, setShowContinueEndDialog] = useState(false) // New state for continue/end dialog
  const [tavusConversation, setTavusConversation] = useState<{ conversationId: string, conversationUrl: string } | null>(null)
  const dailyMinimalRef = useRef<{ connect: () => Promise<void>, sendMessageToPersona: (text: string) => void, setLocalAudioEnabled?: (enabled: boolean) => void } | null>(null)
  const [personaJoined, setPersonaJoined] = useState(false)
  const [meetingJoined, setMeetingJoined] = useState(false)
  const [readyToStart, setReadyToStart] = useState(false)
  const [freeChatMode, setFreeChatMode] = useState(false)
  const [freeChatText, setFreeChatText] = useState("")
  const [freeChatListening, setFreeChatListening] = useState(false)
  const [freeChatPos, setFreeChatPos] = useState<{x:number,y:number}>({ x: 16, y: 16 })
  const draggingRef = useRef<{dx:number, dy:number} | null>(null)
  const [questionHistory, setQuestionHistory] = useState<string[]>([])
  const [jdExpanded, setJdExpanded] = useState(false)
  const freeChatModeRef = useRef<boolean>(false)

  useEffect(() => { freeChatModeRef.current = freeChatMode }, [freeChatMode])

  // Azure Speech recognition hook (PRIMARY method)
  const {
    transcript: azureTranscript,
    interimTranscript: azureInterimTranscript,
    isListening: azureIsListening,
    isSupported: azureSupported,
    startListening: startAzureSpeech,
    stopListening: stopAzureSpeech,
    resetTranscript: resetAzureSpeech,
    error: azureError
  } = useAzureSpeech({
    onResult: (transcript, isFinal) => {
      console.log("[Azure Speech] Result:", { transcript, isFinal })
      if (isFinal) {
        // For final results, update the current transcript
        console.log("[Azure Speech] Final transcript updated:", transcript)
        if (freeChatModeRef.current) {
          setFreeChatText(transcript)
        } else {
          setCurrentTranscript(transcript)
        }
      } else {
        // For interim results, show the accumulated transcript
        console.log("[Azure Speech] Interim transcript:", transcript)
        if (freeChatModeRef.current) {
          setFreeChatText(transcript)
        } else {
          setCurrentTranscript(transcript)
        }
      }
    },
    onError: (error) => {
      console.error("[Azure Speech] Recognition error:", error)
    }
  })

  // Audio transcription fallback hook
  const {
    isRecording: audioRecording,
    isSupported: audioSupported,
    error: audioError,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    getAudioLevel
  } = useAudioTranscription({
    onResult: (transcript) => {
      console.log("[Audio] Transcription result:", transcript)
      setCurrentTranscript(transcript)
      addTranscriptEntry(transcript)
    },
    onError: (error) => {
      console.error("[Audio] Transcription error:", error)
    }
  })

  // Store state
  const {
    sessionId,
    currentQuestion,
    questionIdx,
    phase,
    isRecording,
    partials: currentTranscript,
    finalTranscript,
    timeElapsed,
    timeRemaining,
    isTimerActive,
    audioBlob,
    setSessionId,
    setCurrentQuestion,
    setQuestionIdx,
    setPhase,
    setRecording,
    setPartials: setCurrentTranscript,
    setFinalTranscript,
    addTranscriptEntry,
    setTimeElapsed,
    setTimeRemaining,
    setTimerActive,
    setAudioBlob,
    setPersona,
    setDifficulty,
    setMode,
  } = useInterviewStore()

  // Inactivity cleanup: end Tavus conversation after 2 minutes of no user activity
  useEffect(() => {
    if (!tavusConversation?.conversationId) return
    let idleTimer: NodeJS.Timeout | null = null

    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer)
      idleTimer = setTimeout(async () => {
        try {
          await fetch("/api/tavus/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversation_id: tavusConversation.conversationId, delete: true })
          })
        } catch {}
      }, 2 * 60 * 1000)
    }

    resetTimer()
    const onActivity = () => resetTimer()
    window.addEventListener('mousemove', onActivity)
    window.addEventListener('keydown', onActivity)
    window.addEventListener('click', onActivity)

    return () => {
      window.removeEventListener('mousemove', onActivity)
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('click', onActivity)
      if (idleTimer) clearTimeout(idleTimer)
    }
  }, [tavusConversation?.conversationId])

  // Initialize session
  useEffect(() => {
    setSessionId(session.id)
    setPersona(session.persona.toUpperCase() as any)
    setDifficulty(session.difficulty.toUpperCase() as any)
    setMode(session.mode)

    // Initialize timer based on mode
    switch (session.mode) {
      case "1min":
        setTimeRemaining(1 * 60)
        break
      case "5min":
        setTimeRemaining(5 * 60)
        break
      case "10min":
        setTimeRemaining(10 * 60)
        break
      case "15min":
        setTimeRemaining(15 * 60)
        break
      case "30min":
        setTimeRemaining(30 * 60)
        break
      case "60min":
        setTimeRemaining(60 * 60)
        break
      default:
        setTimeRemaining(null) // unlimited
        break
    }

    // If HR round, show resume information instead of job description
    if (session.persona === "hr") {
      const hasResume = session.resume_text && session.resume_text.trim()
      const hrJd = hasResume ? `Resume Information:\n\n${session.resume_text}` : HR_SCREENING_JD
      setJobDescription(hrJd)
      setHasJobDescription(true)
      setIsWaitingForJobDescription(false)
    } else if (session.persona === "behavioral") {
      const desc = session.job_description?.trim().toLowerCase() || ""
      const isGeneric = !desc || desc.startsWith("interview session for behavioral role") || desc.includes("behavioral role at")
      const jd = isGeneric ? BEHAVIORAL_JD : session.job_description
      setJobDescription(jd || BEHAVIORAL_JD)
      setHasJobDescription(true)
      setIsWaitingForJobDescription(false)
    }

    // Do NOT auto-fetch first question; Start Interview will control it
  }, [session, hasJobDescription])

  // Handle Tavus conversation ready (from TavusAvatar)
  const handleConversationReady = (conv: { conversationId: string, conversationUrl: string }) => {
    setTavusConversation({ conversationId: conv.conversationId, conversationUrl: conv.conversationUrl })
  }

  // Control: do not fetch any question until user clicks Start Interview and persona is ready
  useEffect(() => {
    setReadyToStart(meetingJoined && personaJoined)
  }, [meetingJoined, personaJoined])

  // Robust ticking timer using functional updates to avoid stale closures
  useEffect(() => {
    if (!isTimerActive) return
    const id = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
      if (session.mode !== "unlimited") {
        setTimeRemaining((prev) => {
          if (prev === null) return null
          const next = prev - 1
          if (next <= 0) {
            clearInterval(id)
            setTimerActive(false)
            return 0
          }
          return next
        })
      }
    }, 1000)
    return () => clearInterval(id)
  }, [isTimerActive, session.mode])

  // Recording duration timer
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setRecordingDuration(Date.now() - recordingStartTimeRef.current)
      }, 100)
      setRecordingInterval(interval)
    } else {
      if (recordingInterval) {
        clearInterval(recordingInterval)
        setRecordingInterval(null)
      }
    }

    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval)
      }
    }
  }, [isRecording])

  // Fetch first question - only after job description is provided
  const fetchFirstQuestion = async () => {
    try {
      console.log("[Interview] Fetching first question with job description:", jobDescription)
      const response = await fetch("/api/interview/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          session_id: session.id, // Fixed: use session_id (with underscore)
          job_description: jobDescription, // Fixed: use job_description (with underscore)
          persona: session.persona,
          difficulty: session.difficulty,
          mode: session.mode
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[Interview] First question received:", data.question)
        setCurrentQuestion(data.question)
        setQuestionHistory(prev => [...prev, `Q${prev.length + 1}: ${data.question}`])
        setPhase("asking")
        setTimerActive(true)
        
        // Make avatar speak the question after join
        if (dailyMinimalRef.current) {
          console.log("[Interview] Avatar speaking question...")
          setTimeout(() => dailyMinimalRef.current?.sendMessageToPersona(data.question), 1000)
        }
        
        // Wait for avatar to finish speaking before allowing recording
        const speakingDuration = Math.max(3000, data.question.length * 50)
        setTimeout(() => {
          setPhase("listening")
        }, speakingDuration)
      }
    } catch (error) {
      console.error("Failed to fetch first question:", error)
    }
  }

  // Fetch next question
  const fetchNextQuestion = async () => {
    try {
      console.log("[Interview] Fetching next question...")
      
      // Clear transcripts before new question
      setCurrentTranscript("")
      setFinalTranscript("")
      resetAzureSpeech()
      
      const response = await fetch("/api/interview/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          session_id: session.id, // Fixed: use session_id (with underscore)
          job_description: jobDescription, // Fixed: use job_description (with underscore)
          persona: session.persona,
          difficulty: session.difficulty,
          mode: session.mode
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.question) {
          console.log("[Interview] Next question received:", data.question)
          setCurrentQuestion(data.question)
          setQuestionIdx(questionIdx + 1)
          setQuestionHistory(prev => [...prev, `Q${prev.length + 1}: ${data.question}`])
          setPhase("asking")
          
          // Force re-render by updating state
          console.log("[Interview] Question updated in store, current question:", data.question)
          
          // Make avatar speak the question
          if (dailyMinimalRef.current) {
            console.log("[Interview] Avatar speaking question...")
            setTimeout(() => dailyMinimalRef.current?.sendMessageToPersona(data.question), 1000)
          }
          
          // Wait for avatar to finish speaking before allowing recording
          const speakingDuration = Math.max(3000, data.question.length * 50)
          setTimeout(() => {
            setPhase("listening")
          }, speakingDuration)
        } else {
          handleEndInterview()
        }
      }
    } catch (error) {
      console.error("Failed to fetch next question:", error)
    }
  }

  // Handle job description submission (no question generation here)
  const handleJobDescriptionSubmit = () => {
    if (jobDescription.trim()) {
      setHasJobDescription(true)
      setIsWaitingForJobDescription(false)
      fetch(`/api/interview/session/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription.trim() })
      })
      // Do NOT fetch question yet. Wait for Start Interview.
    }
  }

  // Handle record toggle with Azure Speech
  const handleRecordToggle = async () => {
    if (phase !== "listening" && phase !== "finalizing") return

    if (!isRecording) {
      // Start recording
      try {
        console.log("[Recording] Starting recording...")
        
        // If Free Chat is active, stop its STT and close the overlay to prevent cross-fill
        if (freeChatMode) {
          try { await stopAzureSpeech(); } catch {}
          setFreeChatListening(false)
          setFreeChatMode(false)
        }

        // Always start a fresh transcript session for each recording
        setCurrentTranscript("")
        setFinalTranscript("")
        resetAzureSpeech()

        // Use Azure Speech as PRIMARY method
        if (azureSupported && !azureError) {
          console.log("[Recording] Using Azure Speech recognition")
          await startAzureSpeech()
        } else if (audioSupported) {
          console.log("[Recording] Azure Speech not available, using audio recording fallback")
          startAudioRecording()
        } else {
          // Fallback to manual input
          console.log("[Recording] No speech recognition available, showing manual input")
          setShowManualInput(true)
          setPhase("reviewing")
          return
        }

        // Set up audio recording for backup
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        })
        mediaRecorderRef.current = new MediaRecorder(stream)
        audioChunksRef.current = []
        recordingStartTimeRef.current = Date.now()
        setRecordingDuration(0)

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
          setAudioBlob(audioBlob)
          const duration = Date.now() - recordingStartTimeRef.current
          setRecordingDuration(duration)
          console.log("[Recording] Audio blob created:", { size: audioBlob.size, duration })
        }

        // Ensure persona cannot hear during answer
        dailyMinimalRef.current?.setLocalAudioEnabled?.(false)
        mediaRecorderRef.current.start()
        setRecording(true)
        setIsListening(true)
        setPhase("listening")

        console.log("[Recording] Recording started successfully")
      } catch (error) {
        console.error("Failed to start recording:", error)
        // Show manual input as fallback
        setShowManualInput(true)
        setPhase("reviewing")
      }
    } else {
      // Stop recording
      console.log("[Recording] Stopping recording...")
      
      // Stop speech recognition
      if (azureSupported) {
        await stopAzureSpeech()
      }
      
      // Stop audio transcription
      if (audioSupported) {
        stopAudioRecording()
      }
      
      // Stop media recorder
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      }
      
      setRecording(false)
      setIsListening(false)
      setPhase("finalizing")

      console.log("[Recording] Recording stopped")

      // Finalize transcript - use the accumulated transcript from Azure Speech
      setTimeout(() => {
        const finalText = azureTranscript || currentTranscript || manualTranscript || "No transcript available"
        console.log("[Recording] Finalizing transcript:", finalText)
        setFinalTranscript(finalText)
        
        // Add the complete transcript as one entry
        if (finalText && finalText !== "No transcript available") {
          addTranscriptEntry(finalText.trim())
        }
        
        setPhase("reviewing")
      }, 1000)
    }
  }

  // Handle retry
  const handleRetry = () => {
    console.log("[Recording] Retrying recording...")
    setCurrentTranscript("")
    setFinalTranscript("")
    setManualTranscript("")
    setAudioBlob(null)
    setRecordingDuration(0)
    resetAzureSpeech()
    setShowManualInput(false)
    setPhase("listening")
  }

  // Handle manual submit
  const handleManualSubmit = () => {
    if (manualTranscript.trim()) {
      console.log("[Recording] Manual transcript submitted:", manualTranscript)
      setCurrentTranscript(manualTranscript)
      setFinalTranscript(manualTranscript)
      setPhase("reviewing")
    }
  }

  // Handle answer approval with proper error handling
  const handleApprove = async () => {
    try {
      console.log("[Answer] Submitting answer:", finalTranscript)

      // Prepare answer data with persona and job description
      const answerData = {
        sessionId: sessionId,
        questionNumber: questionIdx + 1,
        questionText: currentQuestion,
        answerTranscript: finalTranscript,
        durationMs: recordingDuration,
        confidenceScore: 0.8,
        persona: session.persona,
        difficulty: session.difficulty,
        mode: session.mode,
        jobDescription: jobDescription,
        evaluation: {
          score: Math.floor(Math.random() * 40) + 60, // Random score 60-100
          feedback: "Good answer! Keep it up.",
          strengths: ["Clear communication", "Good structure"],
          improvements: ["Add more specific examples"],
          keywords: ["experience", "skills", "teamwork"],
          sentiment: "positive",
          clarity_score: 0.8
        },
        score: Math.floor(Math.random() * 40) + 60,
        feedback: "Good answer! Keep it up."
      }

      console.log("[Answer] Submitting answer data:", answerData)

      // Submit answer to backend
      const response = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answerData),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[Answer] Answer submitted successfully:", data)
        
        // If time has expired, skip dialog and end interview immediately
        if (session.mode !== "unlimited" && (timeRemaining === null || timeRemaining <= 0)) {
          handleEndInterview()
        } else {
          // Otherwise show continue/end dialog
          setShowContinueEndDialog(true)
        }
        
      } else {
        const errorData = await response.json()
        console.error("[Answer] Failed to submit answer:", response.status, errorData)
        
        // Show user-friendly error message
        alert(`Failed to submit answer: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("[Answer] Error submitting answer:", error)
      alert("Network error. Please check your connection and try again.")
    }
  }

  // Handle continue to next question
  const handleContinue = () => {
    setShowContinueEndDialog(false)
    // If timer already ended, go straight to summary
    if (session.mode !== "unlimited" && (timeRemaining === null || timeRemaining <= 0)) {
      handleEndInterview()
      return
    }
    fetchNextQuestion()
  }

  // Handle end interview
  const handleEndInterview = async () => {
    try {
      console.log("[Interview] Ending interview...")
      // Best-effort: end Tavus conversation if present
      if (tavusConversation?.conversationId) {
        try {
          await fetch("/api/tavus/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversation_id: tavusConversation.conversationId, delete: true })
          })
        } catch (e) {
          console.warn("[Interview] Failed to end Tavus conversation (non-fatal)")
        }
      }
      const response = await fetch("/api/interview/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          finalScore: 85, // This will be calculated dynamically in summary
          feedback: "Great interview performance!",
          durationMinutes: Math.floor(timeElapsed / 60)
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[Interview] Interview ended:", data)
        router.push(`/interview/${sessionId}/summary`)
      } else {
        console.error("[Interview] Failed to end interview:", response.status)
        // Still redirect to summary even if API call fails
        router.push(`/interview/${sessionId}/summary`)
      }
    } catch (error) {
      console.error("[Interview] Error ending interview:", error)
      // Still redirect to summary even if API call fails
      router.push(`/interview/${sessionId}/summary`)
    }
  }

  // Format time helper
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Show job description input for TECH persona only when not provided
  if (isWaitingForJobDescription && session.persona === "tech") {
    return (
      <div className="h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <div className="w-full max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-card/50 to-card/30 border-border/50 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                  Job Description Required
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Please provide a job description to generate personalized interview questions
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="job-description" className="text-foreground font-medium">
                    Job Description
                  </Label>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the complete job description including requirements, responsibilities, and qualifications..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={8}
                    className="mt-2"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleJobDescriptionSubmit}
                    disabled={!jobDescription.trim()}
                    className="flex-1"
                    size="lg"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Start Interview
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-background via-muted/20 to-background flex">
      {/* Left Sidebar - Resizable */}
      <div 
        className="bg-gradient-to-b from-muted/30 to-muted/20 border-r border-border/50 flex-shrink-0 flex flex-col relative backdrop-blur-sm"
        style={{ width: `${leftPanelWidth}px` }}
      >
        {/* Resize Handle */}
        <div
          className="absolute top-0 right-0 w-1 h-full bg-border hover:bg-primary/50 cursor-col-resize transition-colors group"
          onMouseDown={(e) => {
            const startX = e.clientX
            const startWidth = leftPanelWidth
            
            const handleMouseMove = (e: MouseEvent) => {
              const deltaX = e.clientX - startX
              const maxWidth = Math.floor(window.innerWidth * 0.5)
              const newWidth = Math.max(200, Math.min(maxWidth, startWidth + deltaX))
              setLeftPanelWidth(newWidth)
            }
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }
            
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        >
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 w-2 h-8 bg-muted rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-2 h-8" />
          </div>
        </div>

        {/* AI Interviewer Video - Always Visible */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Mic className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">AI Interviewer</h3>
          </div>
          <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-border/50 flex items-center justify-center overflow-hidden">
            {!tavusConversation ? (
              <TavusAvatar 
                sessionId={session.id} 
                onConversationReady={handleConversationReady}
                renderVideo={false}
              />
            ) : (
              <DailyMinimal
                roomUrl={tavusConversation.conversationUrl}
                conversationId={tavusConversation.conversationId}
                connectOnMount
                onJoined={() => setMeetingJoined(true)}
                onReplicaReady={() => setPersonaJoined(true)}
                onRef={(ref) => {
                  dailyMinimalRef.current = ref
                  ;(window as any).tavusAvatar = {
                    sendMessage: (text: string) => {
                      ref.sendMessageToPersona(text)
                    }
                  }
                }}
              />
            )}
        </div>
          <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                phase === "asking" ? "bg-yellow-500 animate-pulse" :
                phase === "listening" ? "bg-green-500" :
                phase === "finalizing" ? "bg-blue-500 animate-pulse" :
                "bg-muted-foreground"
              }`}></div>
              <span className="text-xs text-muted-foreground font-medium">
                {phase === "asking" && "AI is asking the question..."}
                {phase === "listening" && "Ready for your answer"}
                {phase === "finalizing" && "Processing your answer..."}
                {phase === "reviewing" && "Review your answer"}
              </span>
      </div>
          </div>
          </div>

        {/* Timer - Always Visible */}
        <div className="p-6 border-b border-border/50">
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-4 border border-border/50">
            <TimerBadge
              timeRemaining={timeRemaining}
              timeElapsed={timeElapsed}
              mode={session.mode as any}
              isActive={isTimerActive}
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-foreground font-medium">
                Question {questionIdx + 1}
              </div>
                      <div className="text-xs text-muted-foreground">
                        {session.persona.toUpperCase()} • {session.difficulty.toUpperCase()}
                      </div>
                    </div>
          </div>
        </div>

        {/* Recording Controls - Always Visible */}
        <div className="p-6 flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Mic className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-foreground">Your Answer</h3>
          </div>
          
          <div className="space-y-4">
            {/* Start Interview Control */}
            {!isTimerActive && !currentQuestion && (
              <Button
                onClick={async () => {
                  if (!readyToStart) return
                  // Persona short greeting (1-2 lines)
                  dailyMinimalRef.current?.sendMessageToPersona(
                    `Hello! I'm your AI interviewer. Let's begin a ${session.persona} interview.`
                  )
                  // Small gap before first question
                  setTimeout(() => { fetchFirstQuestion() }, 5000)
                }}
                className="w-full gap-3 bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium"
                size="lg"
                disabled={!readyToStart}
              >
                Start Interview
              </Button>
            )}
            {/* Persona is permanently deaf; no hearing toggle */}
            {phase === "listening" && !isRecording && (
              <Button
                onClick={handleRecordToggle}
                className="w-full gap-3 bg-green-600 hover:bg-green-700 text-white h-12 text-base font-medium"
                size="lg"
              >
                <Mic className="h-5 w-5" />
                Start Recording
                        </Button>
            )}

            {phase === "listening" && isRecording && (
              <Button
                onClick={handleRecordToggle}
                variant="destructive"
                className="w-full gap-3 h-12 text-base font-medium"
                size="lg"
              >
                <Square className="h-5 w-5" />
                Stop Recording
              </Button>
            )}

            {phase === "reviewing" && (
              <div className="space-y-3">
                <Button
                  onClick={handleApprove}
                  className="w-full gap-3 h-12 text-base font-medium"
                  size="lg"
                >
                  <Send className="h-5 w-5" />
                  Submit Answer
                </Button>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="w-full gap-3 h-10"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </Button>
                {/* Free Chat Mode Controls removed here; kept in Current Question card */}
              </div>
            )}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center justify-center gap-2 text-destructive font-medium text-sm"
              >
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                Recording... {formatTime(recordingDuration / 1000)}
              </motion.div>
            </div>
          )}

          {/* Speech Recognition Status */}
          {azureError && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive text-sm">
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                Azure Speech Error: {azureError}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-muted/20 backdrop-blur-sm flex-shrink-0">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Interview Session</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300">
                      {(session as any).session_type ? String((session as any).session_type).toUpperCase() : session.persona.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300">
                      {session.difficulty.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300">
                      {session.mode}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Current Question */}
            <Card className="bg-gradient-to-br from-card/50 to-card/30 border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-foreground">Current Question</CardTitle>
                  </div>
                  <Button
                    variant={freeChatMode ? "destructive" : "outline"}
                    size="sm"
                    onClick={async () => {
                      if (!freeChatMode) {
                        // Open Free Chat: persona stays deaf, clear transcripts, start STT for chat
                        dailyMinimalRef.current?.setLocalAudioEnabled?.(false)
                        setFreeChatText("")
                        setFreeChatMode(true)
                        setCurrentTranscript("")
                        setFinalTranscript("")
                        try { await startAzureSpeech(); setFreeChatListening(true) } catch {}
                      } else {
                        // Close Free Chat: stop STT
                        try { await stopAzureSpeech(); setFreeChatListening(false) } catch {}
                        dailyMinimalRef.current?.setLocalAudioEnabled?.(false)
                        setFreeChatMode(false)
                      }
                    }}
                  >
                    {freeChatMode ? "Close Free Chat" : "Free Chat"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative min-h-[140px] p-6 bg-gradient-to-br from-muted/30 to-muted/20 rounded-xl border border-border/30">
                  {freeChatMode && (
                    <div
                      className="absolute bg-background/95 border rounded-lg shadow-lg p-3 z-20 cursor-move select-none"
                      onMouseDown={(e) => {
                        // Allow drag by grabbing anywhere in the box
                        draggingRef.current = { dx: e.clientX - freeChatPos.x, dy: e.clientY - freeChatPos.y }
                        const move = (ev: MouseEvent) => {
                          if (!draggingRef.current) return
                          setFreeChatPos({ x: Math.max(8, ev.clientX - draggingRef.current.dx), y: Math.max(8, ev.clientY - draggingRef.current.dy) })
                        }
                        const up = () => {
                          draggingRef.current = null
                          document.removeEventListener('mousemove', move)
                          document.removeEventListener('mouseup', up)
                        }
                        document.addEventListener('mousemove', move)
                        document.addEventListener('mouseup', up)
                      }}
                      style={{ left: freeChatPos.x, top: freeChatPos.y, right: 'auto' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Free Chat</div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!freeChatText.trim() || !tavusConversation) return
                              try {
                                const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/feedback/free-chat`, {
                                  method: "POST",
                                  headers: { 
                                    "Content-Type": "application/json",
                                    "ngrok-skip-browser-warning": "true",
                                    "User-Agent": "Mozilla/5.0 (compatible; NextJS-App)"
                                  },
                                  body: JSON.stringify({ text: freeChatText.trim(), conversation_id: tavusConversation.conversationId, job_description: jobDescription, context: questionHistory.join("\n") })
                                })
                                const data = await resp.json()
                                const ai = data?.ai_response || ""
                                dailyMinimalRef.current?.sendMessageToPersona(ai)
                                setFreeChatText("")
                              } catch (e) {
                                console.error("[FreeChat] backend error", e)
                              }
                            }}
                          >
                            Send
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try { await stopAzureSpeech(); setFreeChatListening(false) } catch {}
                              setFreeChatMode(false)
                            }}
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                      <Textarea rows={2} value={freeChatText} onChange={(e) => setFreeChatText(e.target.value)} />
                      <div className="mt-1 text-[10px] text-muted-foreground">Persona is deaf. Your speech is transcribed locally; click Send to get a backend answer.</div>
                    </div>
                  )}
                  {currentQuestion ? (
                    <div>
                      <div 
                        className="text-lg leading-relaxed prose prose-invert max-w-none text-foreground"
                        dangerouslySetInnerHTML={{ 
                          __html: currentQuestion
                            .replace(/\n/g, '<br>')
                            .replace(/^\d+\.\s/gm, '<br><span class="font-semibold text-blue-600 dark:text-blue-400">$&</span>')
                            .replace(/^-\s/gm, '<br>• ')
                            .replace(/^\*\s/gm, '<br>• ')
                            .replace(/^•\s/gm, '<br>• ')
                            .replace(/^<br>/, '')
                        }}
                      />
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Question {questionIdx + 1} - Phase: {phase}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          phase === "asking" ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300" :
                          phase === "listening" ? "bg-green-500/20 text-green-700 dark:text-green-300" :
                          phase === "finalizing" ? "bg-blue-500/20 text-blue-700 dark:text-blue-300" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {phase.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                        <p className="text-foreground">Loading question...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Description (collapsible) */}
            {jobDescription && (
              <Card className="bg-gradient-to-br from-card/50 to-card/30 border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <CardTitle className="text-foreground">Job Description</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setJdExpanded(v => !v)}>
                      {jdExpanded ? "Hide" : "Show more"}
                    </Button>
                  </div>
                </CardHeader>
                {jdExpanded && (
                  <CardContent>
                    <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/20 rounded-xl border border-border/30">
                      <p className="text-sm leading-relaxed text-foreground">
                        {jobDescription}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Transcript Panel */}
            <TranscriptPanel 
              speechSupported={azureSupported}
              phase={phase}
            />
          </div>
        </div>
      </div>

      {/* Right Sidebar removed as per request */}

      {/* Continue/End Dialog */}
      {showContinueEndDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="w-full max-w-md mx-4 bg-gradient-to-br from-card/90 to-card/70 border-border/50 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Answer Submitted!</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Your answer has been submitted successfully. What would you like to do next?
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={handleContinue}
                    className="w-full gap-3 h-12 text-base font-medium"
                  >
                    <ArrowRight className="h-5 w-5" />
                    Continue to Next Question
                  </Button>
                  <Button
                    onClick={handleEndInterview}
                    variant="outline"
                    className="w-full gap-3 h-10"
                  >
                    <X className="h-4 w-4" />
                    End Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}