"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Code, Clock } from "lucide-react"
import { CORE_CS_JD } from "@/lib/default-jds"

export default function NewCodingPracticePage() {
  const router = useRouter()
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium")
  const [mode, setMode] = useState<"5min" | "10min" | "15min" | "30min" | "60min" | "unlimited">("10min")
  const [isCreating, setIsCreating] = useState(false)

  const mapDifficulty = (d: "Easy" | "Medium" | "Hard") => d === "Easy" ? "junior" : d === "Medium" ? "mid" : "senior"

  const start = async () => {
    setIsCreating(true)
    try {
      const res = await fetch("/api/interview/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // persona skipped
          difficulty: mapDifficulty(difficulty),
          mode,
          title: `Core CS Concepts - ${difficulty} / ${mode}`,
          description: CORE_CS_JD,
          jobDescription: CORE_CS_JD,
          session_type: "core_cs",
        }),
      })
      if (!res.ok) throw new Error("create session failed")
      const data = await res.json()
      router.push(`/interview/${data.session_id}`)
    } catch (e) {
      console.error("coding create failed", e)
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
              <h1 className="text-xl font-semibold">New Core CS Concepts Round</h1>
              <p className="text-sm text-muted-foreground">Pick difficulty and duration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {["Easy","Medium","Hard"].map((d) => (
                <Button key={d} variant={difficulty===d?"default":"outline"} className="justify-start h-auto p-4" onClick={() => setDifficulty(d as any)}>
                  <Code className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{d}</div>
                    <div className="text-xs opacity-70">{d === "Easy"?"Warm-up": d === "Medium"?"Standard": "Challenging"}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {["5min","10min","15min","30min","60min","unlimited"].map((m) => (
                <Button key={m} variant={mode===m?"default":"outline"} className="justify-start h-auto p-4" onClick={() => setMode(m as any)}>
                  <Clock className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{m}</div>
                    <div className="text-xs opacity-70">{m==="unlimited"?"No time limit":"Timed practice"}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={start} size="lg" className="gap-2">
            <Play className="h-5 w-5" />
            {isCreating?"Creating...":"Start Core CS Concepts"}
          </Button>
        </div>
      </div>
    </div>
  )
}


