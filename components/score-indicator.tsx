// components/score-indicator.tsx
import React from "react"

interface ScoreIndicatorProps {
    score: number
    maxScore?: number
    showLabel?: boolean
  }
  
  export function ScoreIndicator({ score, maxScore = 100, showLabel = true }: ScoreIndicatorProps) {
    const getScoreColor = (score: number) => {
      if (score >= 80) return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950"
      if (score >= 60) return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950"
      if (score >= 40) return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950"
      if (score >= 20) return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950"
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950"
    }
  
    const getScoreLabel = (score: number) => {
      if (score >= 80) return "Excellent"
      if (score >= 60) return "Good"
      if (score >= 40) return "Average"
      if (score >= 20) return "Below Average"
      return "Needs Improvement"
    }
  
    return (
      <div className="flex items-center gap-3">
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score)}`}>
          {score}/{maxScore}
        </div>
        {showLabel && (
          <span className="text-sm font-medium text-muted-foreground">
            {getScoreLabel(score)}
          </span>
        )}
      </div>
    )
  }