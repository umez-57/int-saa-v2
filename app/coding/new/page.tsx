"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Code, Clock, Sun, Moon } from "lucide-react"
import { CORE_CS_JD } from "@/lib/default-jds"

export default function NewCodingPracticePage() {
  const router = useRouter()
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium")
  const [mode, setMode] = useState<"10min" | "15min" | "30min">("10min")
  const [isCreating, setIsCreating] = useState(false)
  const [isDark, setIsDark] = useState(false)

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
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/15 dark:bg-blue-500/10 rounded-full"
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
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">New Core CS Concepts Round</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pick difficulty and duration</p>
              </div>
            </div>
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

      <div className="container mx-auto px-6 py-8 max-w-6xl relative z-10">
        {/* Horizontal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Difficulty Selection - Left Side */}
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-blue-500/20 dark:bg-blue-600/20 rounded-lg backdrop-blur-sm border border-blue-300 dark:border-blue-600">
                  <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Difficulty Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {["Easy","Medium","Hard"].map((d) => {
                  const getDifficultyColors = (level: string, isSelected: boolean) => {
                    if (!isSelected) {
                      return "bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600/70 hover:border-gray-400 dark:hover:border-gray-500 text-gray-900 dark:text-white"
                    }
                    
                    switch (level) {
                      case "Easy":
                        return "bg-green-500/20 dark:bg-green-500/15 hover:bg-green-500/30 dark:hover:bg-green-500/25 text-green-700 dark:text-green-300 border-2 border-green-400/40 dark:border-green-400/30 hover:border-green-500/60 dark:hover:border-green-500/50 backdrop-blur-sm"
                      case "Medium":
                        return "bg-yellow-500/20 dark:bg-yellow-500/15 hover:bg-yellow-500/30 dark:hover:bg-yellow-500/25 text-yellow-700 dark:text-yellow-300 border-2 border-yellow-400/40 dark:border-yellow-400/30 hover:border-yellow-500/60 dark:hover:border-yellow-500/50 backdrop-blur-sm"
                      case "Hard":
                        return "bg-red-500/20 dark:bg-red-500/15 hover:bg-red-500/30 dark:hover:bg-red-500/25 text-red-700 dark:text-red-300 border-2 border-red-400/40 dark:border-red-400/30 hover:border-red-500/60 dark:hover:border-red-500/50 backdrop-blur-sm"
                      default:
                        return "bg-blue-500/20 dark:bg-blue-500/15 hover:bg-blue-500/30 dark:hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border-2 border-blue-400/40 dark:border-blue-400/30 hover:border-blue-500/60 dark:hover:border-blue-500/50 backdrop-blur-sm"
                    }
                  }
                  
                  return (
                    <Button
                      key={d}
                      variant={difficulty===d?"default":"outline"}
                      className={`justify-start h-auto p-4 ${getDifficultyColors(d, difficulty===d)} transition-all duration-300`}
                      onClick={() => setDifficulty(d as any)}
                    >
                      <Code className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">{d}</div>
                        <div className={`text-xs ${
                          difficulty===d 
                            ? d === "Easy" 
                              ? "text-green-600 dark:text-green-200" 
                              : d === "Medium" 
                                ? "text-yellow-600 dark:text-yellow-200" 
                                : "text-red-600 dark:text-red-200"
                            : "text-gray-600 dark:text-gray-400"
                        }`}>
                          {d === "Easy"?"Warm-up": d === "Medium"?"Standard": "Challenging"}
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Duration Selection - Right Side */}
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 dark:bg-emerald-600/20 rounded-lg backdrop-blur-sm border border-emerald-300 dark:border-emerald-600">
                  <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Session Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {["10min","15min","30min"].map((m) => (
                  <Button 
                    key={m} 
                    variant={mode===m?"default":"outline"} 
                    className={`justify-start h-auto p-4 ${
                      mode===m
                        ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                        : "bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600/70 hover:border-blue-400 dark:hover:border-blue-500 text-gray-900 dark:text-white"
                    } transition-all duration-300`}
                    onClick={() => setMode(m as any)}
                  >
                    <Clock className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{m}</div>
                      <div className={`text-xs ${mode===m ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                        {m==="10min"?"Quick session": m==="15min"?"Standard session":"Extended practice"}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Button - Centered at Bottom */}
        <div className="flex justify-center mt-8">
          <Button 
            onClick={start} 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
            disabled={isCreating}
          >
            <Play className="h-5 w-5" />
            {isCreating?"Creating...":"Start Core CS Concepts"}
          </Button>
        </div>
      </div>
    </div>
  )
}


