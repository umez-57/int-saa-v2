"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useInterviewStore } from "@/lib/store"
import { Clock, Infinity } from "lucide-react"

const difficulties = [
  { value: "junior", label: "Junior Level", description: "Entry-level questions" },
  { value: "mid", label: "Mid Level", description: "Intermediate complexity" },
  { value: "senior", label: "Senior Level", description: "Advanced scenarios" },
]

const modes = [
  { value: "1min", label: "1 Minute", icon: Clock, description: "Quick test run" },
  { value: "5min", label: "5 Minutes", icon: Clock, description: "Quick practice" },
  { value: "10min", label: "10 Minutes", icon: Clock, description: "Standard session" },
  { value: "15min", label: "15 Minutes", icon: Clock, description: "Longer drill" },
  { value: "30min", label: "30 Minutes", icon: Clock, description: "Deep practice" },
  { value: "60min", label: "60 Minutes", icon: Clock, description: "Extended session" },
  { value: "unlimited", label: "Unlimited", icon: Infinity, description: "No time limit" },
]

export function DifficultyModePicker() {
  const { difficulty, mode, setDifficulty, setMode } = useInterviewStore()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Difficulty Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Difficulty Level</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={difficulty} onValueChange={(value) => setDifficulty(value as any)} className="space-y-3">
            {difficulties.map((diff) => (
              <div key={diff.value} className="flex items-center space-x-3">
                <RadioGroupItem value={diff.value} id={diff.value} />
                <Label htmlFor={diff.value} className="flex-1 cursor-pointer">
                  <div>
                    <div className="font-medium">{diff.label}</div>
                    <div className="text-sm text-muted-foreground">{diff.description}</div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Session Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {modes.map((modeOption) => {
              const Icon = modeOption.icon
              const isSelected = mode === modeOption.value

              return (
                <Button
                  key={modeOption.value}
                  variant={isSelected ? "default" : "outline"}
                  className="justify-start h-auto p-4"
                  onClick={() => setMode(modeOption.value as any)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{modeOption.label}</div>
                    <div className="text-xs opacity-70">{modeOption.description}</div>
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
