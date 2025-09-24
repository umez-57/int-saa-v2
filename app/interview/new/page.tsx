// app/interview/new/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PersonaCards } from "@/components/persona-cards"
import { DifficultyModePicker } from "@/components/difficulty-mode-picker"
import { MicCheck } from "@/components/mic-check"
import { ArrowLeft, Play } from "lucide-react"
import { useInterviewStore } from "@/lib/store"

export default function NewInterviewPage() {
  const router = useRouter()
  const { selectedPersona, difficulty, mode } = useInterviewStore()
  const [micCheckComplete, setMicCheckComplete] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">New Interview</h1>
              <p className="text-sm text-muted-foreground">
                Configure your interview session
              </p>
            </div>
            {isDevMode && (
              <Badge variant="outline" className="ml-auto">
                DEV MODE
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Persona Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Interview Type</CardTitle>
            </CardHeader>
            <CardContent>
          <PersonaCards />
            </CardContent>
          </Card>

          {/* Difficulty and Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Configure Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <DifficultyModePicker />
            </CardContent>
          </Card>

          {/* Mic Check */}
          {!isDevMode && (
            <Card>
              <CardHeader>
                <CardTitle>Microphone Check</CardTitle>
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
              className="gap-2"
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