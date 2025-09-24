// components/empty-state.tsx
import React from "react"

interface EmptyStateProps {
  type: 'strengths' | 'improvements' | 'keywords'
  score: number
}

export function EmptyState({ type, score }: EmptyStateProps) {
  const getEmptyMessage = () => {
    switch (type) {
      case 'strengths':
        if (score >= 60) {
          return "Strengths will be identified as you improve your answers"
        } else if (score >= 30) {
          return "Focus on improvements first, then strengths will emerge"
        } else {
          return "No strengths identified - focus on the improvements below"
        }
      case 'improvements':
        return "No specific improvements needed - great job!"
      case 'keywords':
        return "Keywords will appear as you provide more detailed answers"
      default:
        return "No data available"
    }
  }

  return (
    <div className="text-center py-4 text-muted-foreground text-sm">
      <div className="text-2xl mb-2">📝</div>
      <p>{getEmptyMessage()}</p>
    </div>
  )
}