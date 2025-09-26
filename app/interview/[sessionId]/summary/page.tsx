// app/interview/[sessionId]/summary/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Download, 
  Play, 
  Pause, 
  RotateCcw,
  Star,
  TrendingUp,
  Clock,
  MessageSquare,
  BarChart3,
  Target,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Sun,
  Moon
} from "lucide-react"
import { motion } from "framer-motion"
import { MotivationalFeedback } from "@/components/motivational-feedback"
import { ReferenceAnswer } from "@/components/reference-answer"
import { EmptyState } from "@/components/empty-state"
import { ScoreIndicator } from "@/components/score-indicator"

interface Answer {
  id: string
  question_number: number
  question_text: string
  answer_transcript: string
  audio_url?: string
  duration_ms: number
  confidence_score: number
  evaluation: {
    score: number
    feedback: string
    strengths: string[]
    improvements: string[]
    keywords: string[]
    sentiment: string
    clarity_score: number
  }
  score: number
  feedback: string
  created_at: string
}

interface SessionSummary {
  session_id: string
  persona: string
  difficulty: string
  mode: string
  status: string
  total_questions: number
  completed_questions: number
  average_score: number
  duration_minutes: number
  created_at: string
  answers: Answer[]
  job_description?: string
}

export default function InterviewSummaryPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null)
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    fetchSessionSummary()
  }, [sessionId])

  // Theme detection and management
  useEffect(() => {
    // Check for dark mode
    const darkMode = document.documentElement.classList.contains('dark')
    setIsDark(darkMode)
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark')
  }

  const fetchSessionSummary = async () => {
    try {
      setLoading(true)
      
      // Fetch session data
      const sessionResponse = await fetch(`/api/interview/session?sessionId=${sessionId}`)
      if (!sessionResponse.ok) {
        throw new Error("Failed to fetch session data")
      }
      const sessionData = await sessionResponse.json()

      // Fetch answers
      const answersResponse = await fetch(`/api/interview/answer?sessionId=${sessionId}`)
      if (!answersResponse.ok) {
        throw new Error("Failed to fetch answers")
      }
      const answersData = await answersResponse.json()

      // Calculate dynamic metrics from actual answers
      const answers = answersData.answers || []
      const totalDurationMs = answers.reduce((sum: number, answer: Answer) => sum + answer.duration_ms, 0)
      const totalDurationMinutes = Math.round(totalDurationMs / 60000)
      
      // Calculate average score from actual answers
      const averageScore = answers.length > 0 
        ? answers.reduce((sum: number, answer: Answer) => sum + answer.score, 0) / answers.length
        : 0

      // Combine data with calculated metrics
      const summaryData: SessionSummary = {
        session_id: sessionId,
        persona: sessionData.persona || "tech",
        difficulty: sessionData.difficulty || "mid",
        mode: sessionData.mode || "10min",
        status: sessionData.status || "completed",
        total_questions: sessionData.total_questions || answers.length,
        completed_questions: answers.length,
        average_score: averageScore, // Use calculated average
        duration_minutes: totalDurationMinutes, // Use calculated duration
        created_at: sessionData.created_at || new Date().toISOString(),
        answers: answers,
        job_description: sessionData.job_description || ""
      }

      setSummary(summaryData)
    } catch (err) {
      console.error("Failed to fetch session summary:", err)
      setError(err instanceof Error ? err.message : "Failed to load summary")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    if (score >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default"
    if (score >= 80) return "secondary"
    if (score >= 70) return "outline"
    return "destructive"
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const handlePlayAudio = (audioUrl: string, answerId: string) => {
    if (audioPlaying === answerId) {
      setAudioPlaying(null)
      // Stop audio
    } else {
      setAudioPlaying(answerId)
      // Play audio
      const audio = new Audio(audioUrl)
      audio.play()
      audio.onended = () => setAudioPlaying(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center relative">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none">
          <div 
            className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 dark:bg-blue-600/15 rounded-full"
            style={{ filter: 'blur(60px)' }}
          />
          <div 
            className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-600/15 rounded-full"
            style={{ filter: 'blur(60px)' }}
          />
          <div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full"
            style={{ filter: 'blur(80px)' }}
          />
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading interview summary...</p>
        </div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center relative">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none">
          <div 
            className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 dark:bg-blue-600/15 rounded-full"
            style={{ filter: 'blur(60px)' }}
          />
          <div 
            className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-600/15 rounded-full"
            style={{ filter: 'blur(60px)' }}
          />
          <div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full"
            style={{ filter: 'blur(80px)' }}
          />
        </div>
        <Card className="w-full max-w-md bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-xl relative z-10">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Error Loading Summary</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error || "Session not found"}</p>
              <Button onClick={() => router.push("/dashboard")} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 relative">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 dark:bg-blue-600/15 rounded-full"
          style={{ filter: 'blur(60px)' }}
        />
        <div 
          className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-600/15 rounded-full"
          style={{ filter: 'blur(60px)' }}
        />
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full"
          style={{ filter: 'blur(80px)' }}
        />
      </div>

      {/* Header */}
      <div className="border-b-2 border-gray-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg shadow-lg relative z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="gap-2 text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-white/10">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Interview Summary</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {summary.persona.toUpperCase()} • {summary.difficulty.toUpperCase()} • {summary.mode}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600/70 text-gray-900 dark:text-white">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600/70 text-gray-900 dark:text-white">
                <RotateCcw className="h-4 w-4" />
                Retake
              </Button>
              {/* Theme Toggle Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Summary Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Overall Score */}
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="p-2 bg-blue-500/20 dark:bg-blue-600/20 rounded-lg backdrop-blur-sm border border-blue-300 dark:border-blue-600">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Overall Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(summary.average_score)} mb-2`}>
                    {summary.average_score.toFixed(1)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Average Score</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/40 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg p-3 border border-gray-300 dark:border-slate-600">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-900 dark:text-white">Questions Answered</span>
                      <span className="text-gray-900 dark:text-white font-medium">{summary.completed_questions}/{summary.total_questions}</span>
                    </div>
                    <Progress 
                      value={(summary.completed_questions / summary.total_questions) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/40 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-300 dark:border-slate-600">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatDuration(summary.duration_minutes)}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Duration</div>
                    </div>
                    <div className="bg-white/40 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-300 dark:border-slate-600">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {new Date(summary.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Date</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motivational Feedback - Based on Overall Score */}
            <MotivationalFeedback 
              score={Math.round(summary.average_score)}
              questionType={summary.persona}
              persona={summary.persona}
            />

            {/* Performance Metrics */}
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="p-2 bg-green-500/20 dark:bg-green-600/20 rounded-lg backdrop-blur-sm border border-green-300 dark:border-green-600">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {summary.answers.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-white/40 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg p-3 border border-gray-300 dark:border-slate-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-900 dark:text-white">Best Answer</span>
                        <Badge 
                          variant={getScoreBadgeVariant(Math.max(...summary.answers.map(a => a.score)))}
                          className="text-xs font-medium"
                        >
                          {Math.max(...summary.answers.map(a => a.score))}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="bg-white/40 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg p-3 border border-gray-300 dark:border-slate-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-900 dark:text-white">Worst Answer</span>
                        <Badge 
                          variant={getScoreBadgeVariant(Math.min(...summary.answers.map(a => a.score)))}
                          className="text-xs font-medium"
                        >
                          {Math.min(...summary.answers.map(a => a.score))}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="bg-white/40 dark:bg-slate-700/40 backdrop-blur-sm rounded-lg p-3 border border-gray-300 dark:border-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-900 dark:text-white">Consistency</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {summary.answers.length > 1 
                            ? (100 - (Math.max(...summary.answers.map(a => a.score)) - Math.min(...summary.answers.map(a => a.score)))).toFixed(0)
                            : 100
                          }%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Answers */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <div className="p-2 bg-indigo-500/20 dark:bg-indigo-600/20 rounded-lg backdrop-blur-sm border border-indigo-300 dark:border-indigo-600">
                    <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Interview Answers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary.answers.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No answers recorded for this session</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {summary.answers.map((answer, index) => (
                        <motion.div
                          key={answer.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all duration-300 bg-white/40 dark:bg-slate-700/40 backdrop-blur-sm border-2 border-gray-300 dark:border-slate-600 hover:shadow-lg ${
                              selectedAnswer?.id === answer.id ? "ring-2 ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400" : ""
                            }`}
                            onClick={() => setSelectedAnswer(selectedAnswer?.id === answer.id ? null : answer)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">Q{answer.question_number}</Badge>
                                  <ScoreIndicator score={answer.score} />
                                </div>
                                <div className="flex items-center gap-2">
                                  {answer.audio_url && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handlePlayAudio(answer.audio_url!, answer.id)
                                      }}
                                    >
                                      {audioPlaying === answer.id ? (
                                        <Pause className="h-4 w-4" />
                                      ) : (
                                        <Play className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )}
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {Math.round(answer.duration_ms / 1000)}s
                                  </span>
                                </div>
                              </div>
                              
                                <div className="space-y-3">
                                {/* Question Section */}
                                <div className="bg-blue-500/10 dark:bg-blue-600/10 backdrop-blur-sm border-2 border-blue-300 dark:border-blue-600 rounded-lg p-3">
                                  <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Question
                                  </h4>
                                  <p className="text-sm text-blue-600 dark:text-blue-200 leading-relaxed">
                                    {answer.question_text}
                                  </p>
                                </div>
                                
                                {/* User Answer Section */}
                                <div className="bg-emerald-500/10 dark:bg-emerald-600/10 backdrop-blur-sm border-2 border-emerald-300 dark:border-emerald-600 rounded-lg p-3">
                                  <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Your Answer
                                  </h4>
                                  <p className="text-sm text-emerald-600 dark:text-emerald-200 leading-relaxed">
                                    {answer.answer_transcript}
                                  </p>
                                </div>
                              </div>

                              {selectedAnswer?.id === answer.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-4 pt-4 border-t space-y-4"
                                >

                                  {/* Feedback Section */}
                                  <div className="bg-amber-50/50 dark:bg-amber-900/20 backdrop-blur-sm border-2 border-amber-300 dark:border-amber-600 rounded-lg p-3 shadow-sm">
                                    <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-200 mb-2 flex items-center gap-2">
                                      <AlertCircle className="h-4 w-4" />
                                      Feedback
                                    </h4>
                                    <p className="text-sm text-amber-600 dark:text-amber-100 leading-relaxed">
                                      {answer.evaluation.feedback}
                                    </p>
                                  </div>
                                  
                                  {/* Strengths and Improvements Grid */}
                                  <div className="grid grid-cols-2 gap-4">
                                    {/* Strengths Section */}
                                    <div className="bg-green-50/50 dark:bg-green-900/20 backdrop-blur-sm border-2 border-green-300 dark:border-green-600 rounded-lg p-3 shadow-sm">
                                      <h4 className="text-sm font-semibold text-green-700 dark:text-green-200 mb-2 flex items-center gap-1">
                                        <ThumbsUp className="h-4 w-4" />
                                        Strengths
                                      </h4>
                                      {answer.evaluation.strengths && answer.evaluation.strengths.length > 0 ? (
                                        <ul className="text-sm text-green-600 dark:text-green-100 space-y-1">
                                          {answer.evaluation.strengths.map((strength, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                              <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 flex-shrink-0" />
                                              <span>{strength}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <EmptyState type="strengths" score={answer.score} />
                                      )}
                                    </div>
                                    
                                    {/* Improvements Section */}
                                    <div className="bg-orange-50/50 dark:bg-orange-900/20 backdrop-blur-sm border-2 border-orange-300 dark:border-orange-600 rounded-lg p-3 shadow-sm">
                                      <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-200 mb-2 flex items-center gap-1">
                                        <Target className="h-4 w-4" />
                                        Improvements
                                      </h4>
                                      {answer.evaluation.improvements && answer.evaluation.improvements.length > 0 ? (
                                        <ul className="text-sm text-orange-600 dark:text-orange-100 space-y-1">
                                          {answer.evaluation.improvements.map((improvement, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                              <AlertCircle className="h-3 w-3 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                                              <span>{improvement}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <EmptyState type="improvements" score={answer.score} />
                                      )}
                                    </div>
                                  </div>

                                  {/* Reference Answer */}
                                  <ReferenceAnswer
                                    question={answer.question_text}
                                    persona={summary.persona}
                                    difficulty={summary.difficulty}
                                    jobDescription={summary.job_description || ""}
                                    feedbackInsights={answer.evaluation.improvements || []}
                                  />

                                  {/* Keywords */}
                                  <div className="bg-indigo-50/50 dark:bg-indigo-900/20 backdrop-blur-sm border-2 border-indigo-300 dark:border-indigo-600 rounded-lg p-3 shadow-sm">
                                    <h4 className="text-sm font-semibold text-indigo-700 dark:text-indigo-200 mb-2 flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      Keywords
                                    </h4>
                                    {answer.evaluation.keywords && answer.evaluation.keywords.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {answer.evaluation.keywords.map((keyword, idx) => (
                                          <Badge 
                                            key={idx} 
                                            variant="secondary" 
                                            className="text-xs bg-indigo-100/20 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200 border-indigo-300/30 dark:border-indigo-700/50 hover:bg-indigo-200/30 dark:hover:bg-indigo-800/40"
                                          >
                                            {keyword}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <EmptyState type="keywords" score={answer.score} />
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}