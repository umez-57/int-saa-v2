// components/timer-badge.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Clock, Pause, Play } from "lucide-react"

interface TimerBadgeProps {
  timeRemaining: number | null
  timeElapsed: number
  mode: "5min" | "10min" | "15min" | "30min" | "60min" | "unlimited"
  isActive: boolean
}

export function TimerBadge({ timeRemaining, timeElapsed, mode, isActive }: TimerBadgeProps) {
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getVariant = () => {
    if (mode === "unlimited") return "outline"
    if (!timeRemaining) return "outline"
    if (timeRemaining < 60) return "destructive"
    if (timeRemaining < 180) return "default"
    return "secondary"
  }

  const getIcon = () => {
    if (isActive) return <Pause className="h-3 w-3" />
    return <Play className="h-3 w-3" />
  }

  return (
    <Badge 
      variant={getVariant()} 
      className="gap-2"
    >
      {getIcon()}
      <Clock className="h-3 w-3" />
      {mode === "unlimited" 
        ? `Elapsed: ${formatTime(timeElapsed)}`
        : `Remaining: ${formatTime(timeRemaining || 0)}`
      }
    </Badge>
  )
}