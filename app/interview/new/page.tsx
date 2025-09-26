// app/interview/new/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PersonaCards } from "@/components/persona-cards"
import { DifficultyModePicker } from "@/components/difficulty-mode-picker"
import { MicCheck } from "@/components/mic-check"
import { ArrowLeft, Play, Sun, Moon } from "lucide-react"
import { useInterviewStore } from "@/lib/store"

export default function NewInterviewPage() {
  const router = useRouter()
  const { selectedPersona, difficulty, mode } = useInterviewStore()
  const [micCheckComplete, setMicCheckComplete] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDark, setIsDark] = useState(false)

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

  // Check if dev mode is enabled
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true"

  const handleStartInterview = async () => {
    if (!micCheckComplete && !isDevMode) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/interview/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: (selectedPersona || "tech"),
          difficulty: (String(difficulty || "mid").toLowerCase() as any),
          mode: (mode as any),
          title: `${(selectedPersona || "tech").toUpperCase()} Interview - ${String(difficulty || "mid").toUpperCase()}`,
          description: (selectedPersona as any) === "tech" ? "" : `Interview session for ${(selectedPersona as any) || 'tech'} role at ${String(difficulty || 'mid')} level`
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // For HR interviews, redirect to resume upload page
        if (data.redirect_to_upload) {
          router.push(`/hr-upload?sessionId=${data.session_id}`)
        } else {
          router.push(`/interview/${data.session_id}`)
        }
      } else {
        console.error("Failed to create interview session")
      }
    } catch (error) {
      console.error("Error creating interview session:", error)
    } finally {
      setIsCreating(false)
    }
  }

  // Skip mic check in dev mode
  if (isDevMode && !micCheckComplete) {
    setMicCheckComplete(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 relative">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 dark:bg-blue-600/20 rounded-full"
          style={{ filter: 'blur(60px)' }}
        />
        <div 
          className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/30 dark:bg-indigo-600/20 rounded-full"
          style={{ filter: 'blur(60px)' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/15 rounded-full"
          style={{ filter: 'blur(80px)' }}
        />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 dark:bg-black/10 border-b border-white/20 dark:border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="gap-2 text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">New Mock Interview</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure your interview session
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isDevMode && (
                <Badge className="bg-blue-600 text-white">
                  DEV MODE
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-white/10"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 pt-24 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Persona Selection */}
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Choose Interview Type</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonaCards />
            </CardContent>
          </Card>

          {/* Difficulty and Mode Selection */}
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Configure Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <DifficultyModePicker />
            </CardContent>
          </Card>

          {/* Mic Check */}
          {!isDevMode && (
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Microphone Check</CardTitle>
              </CardHeader>
              <CardContent>
                <MicCheck onComplete={() => setMicCheckComplete(true)} sessionId={"temp-session"} />
              </CardContent>
            </Card>
          )}

          {/* Start Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleStartInterview}
              disabled={!micCheckComplete && !isDevMode}
              size="lg"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-5 w-5" />
              {isCreating ? "Creating..." : "Start Interview"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}