"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useInterviewStore } from "@/lib/store"
import { Clock } from "lucide-react"

const difficulties = [
  { value: "junior", label: "Junior Level", description: "Entry-level questions" },
  { value: "mid", label: "Mid Level", description: "Intermediate complexity" },
  { value: "senior", label: "Senior Level", description: "Advanced scenarios" },
]

const modes = [
  { value: "10min", label: "10 Minutes", icon: Clock, description: "Quick session" },
  { value: "15min", label: "15 Minutes", icon: Clock, description: "Standard session" },
  { value: "30min", label: "30 Minutes", icon: Clock, description: "Extended practice" },
]

export function DifficultyModePicker() {
  const { difficulty, mode, setDifficulty, setMode } = useInterviewStore()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Difficulty Selection */}
      <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">Difficulty Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {difficulties.map((diff) => {
              const getDifficultyColors = (level: string, isSelected: boolean) => {
                if (!isSelected) {
                  return "bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600/70 hover:border-gray-400 dark:hover:border-gray-500 text-gray-900 dark:text-white"
                }
                
                switch (level) {
                  case "junior":
                    return "bg-green-500/20 dark:bg-green-500/15 hover:bg-green-500/30 dark:hover:bg-green-500/25 text-green-700 dark:text-green-300 border-2 border-green-400/40 dark:border-green-400/30 hover:border-green-500/60 dark:hover:border-green-500/50 backdrop-blur-sm"
                  case "mid":
                    return "bg-yellow-500/20 dark:bg-yellow-500/15 hover:bg-yellow-500/30 dark:hover:bg-yellow-500/25 text-yellow-700 dark:text-yellow-300 border-2 border-yellow-400/40 dark:border-yellow-400/30 hover:border-yellow-500/60 dark:hover:border-yellow-500/50 backdrop-blur-sm"
                  case "senior":
                    return "bg-red-500/20 dark:bg-red-500/15 hover:bg-red-500/30 dark:hover:bg-red-500/25 text-red-700 dark:text-red-300 border-2 border-red-400/40 dark:border-red-400/30 hover:border-red-500/60 dark:hover:border-red-500/50 backdrop-blur-sm"
                  default:
                    return "bg-blue-500/20 dark:bg-blue-500/15 hover:bg-blue-500/30 dark:hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border-2 border-blue-400/40 dark:border-blue-400/30 hover:border-blue-500/60 dark:hover:border-blue-500/50 backdrop-blur-sm"
                }
              }
              
              const isSelected = difficulty === diff.value
              
              return (
                <Button
                  key={diff.value}
                  variant={isSelected ? "default" : "outline"}
                  className={`justify-start h-auto p-4 ${getDifficultyColors(diff.value, isSelected)} transition-all duration-300`}
                  onClick={() => setDifficulty(diff.value as any)}
                >
                  <div className="text-left">
                    <div className="font-medium">{diff.label}</div>
                    <div className={`text-xs ${
                      isSelected 
                        ? diff.value === "junior" 
                          ? "text-green-600 dark:text-green-200" 
                          : diff.value === "mid" 
                            ? "text-yellow-600 dark:text-yellow-200" 
                            : "text-red-600 dark:text-red-200"
                        : "text-gray-600 dark:text-gray-400"
                    }`}>
                      {diff.description}
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mode Selection */}
      <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">Session Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {modes.map((modeOption) => {
              const Icon = modeOption.icon
              const isSelected = mode === modeOption.value

              return (
                <Button
                  key={modeOption.value}
                  variant={isSelected ? "default" : "outline"}
                  className={`justify-start h-auto p-4 ${
                    isSelected 
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" 
                      : "bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600/70 hover:border-blue-400 dark:hover:border-blue-500 text-gray-900 dark:text-white"
                  } transition-all duration-300`}
                  onClick={() => setMode(modeOption.value as any)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{modeOption.label}</div>
                    <div className={`text-xs ${isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>{modeOption.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
