"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { SYSTEM_DESIGN_JD } from "@/lib/default-jds"

export default function NewSystemDesignPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<"1min" | "5min" | "10min" | "15min" | "30min" | "60min" | "unlimited">("10min")
  const [difficulty, setDifficulty] = useState<"junior" | "mid" | "senior">("mid")
  const [isCreating, setIsCreating] = useState(false)

  const start = async () => {
    setIsCreating(true)
    try {
      const res = await fetch("/api/interview/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // persona and difficulty omitted on purpose
          mode,
          title: `SYSTEM DESIGN Session - ${mode.toUpperCase()} - ${difficulty.toUpperCase()}`,
          description: SYSTEM_DESIGN_JD,
          jobDescription: SYSTEM_DESIGN_JD,
          session_type: "system",
          difficulty,
        }),
      })
      if (!res.ok) throw new Error("create session failed")
      const data = await res.json()
      router.push(`/interview/${data.session_id}`)
    } catch (e) {
      console.error("system design create failed", e)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">New System Design Session</h1>
              <p className="text-sm text-muted-foreground">Choose a duration and start</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {["junior","mid","senior"].map((d) => (
                <Button key={d} variant={difficulty===d?"default":"outline"} className="justify-start h-auto p-4" onClick={() => setDifficulty(d as any)}>
                  <div className="text-left">
                    <div className="font-medium">{d.toUpperCase()}</div>
                    <div className="text-xs opacity-70">{d==="junior"?"Foundational":"senior"===d?"Advanced":"Intermediate"}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {["1min","5min","10min","15min","30min","60min","unlimited"].map((m) => (
                <Button key={m} variant={mode===m?"default":"outline"} className="justify-start h-auto p-4" onClick={() => setMode(m as any)}>
                  <Clock className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{m}</div>
                    <div className="text-xs opacity-70">{m==="unlimited"?"No time limit":"Timed design session"}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-6">
          <Button onClick={start} size="lg" className="gap-2">
            <Play className="h-5 w-5" />
            {isCreating?"Creating...":"Start System Design"}
          </Button>
        </div>
      </div>
    </div>
  )
}


