// components/motivational-feedback.tsx
import { useState, useEffect } from "react"

interface MotivationalFeedbackProps {
    score: number
    questionType: string
    persona: string
    feedback?: string
  }
  
  export function MotivationalFeedback({ score, questionType, persona, feedback }: MotivationalFeedbackProps) {
    // Create a cache key for motivational feedback
    const cacheKey = `motivational_${score}_${questionType}_${persona}`
    
    const [motivationalText, setMotivationalText] = useState(() => {
      // Check localStorage first, then use feedback prop
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey)
        if (cached) return cached
      }
      return feedback || ""
    })
    const [isLoading, setIsLoading] = useState(!motivationalText)
  
    useEffect(() => {
      if (!motivationalText) {
        fetchMotivationalFeedback()
      }
    }, [score, questionType, persona])
  
    const fetchMotivationalFeedback = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`http://localhost:8000/feedback/motivational`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score,
            question_type: questionType,
            persona
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          const feedback = data.motivational_feedback
          setMotivationalText(feedback)
          // Cache the feedback in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(cacheKey, feedback)
          }
        }
      } catch (error) {
        console.error('Failed to fetch motivational feedback:', error)
        setMotivationalText(getFallbackFeedback(score))
      } finally {
        setIsLoading(false)
      }
    }
  
    const getFallbackFeedback = (score: number) => {
      if (score >= 80) return "Outstanding performance! You nailed it! Keep up the excellent work and continue building on this success."
      if (score >= 60) return "Great job! Keep building on this momentum! You're on the right track and showing strong potential."
      if (score >= 40) return "Good effort! Focus on the improvements to excel! You have a solid foundation to build upon."
      if (score >= 20) return "Don't lose hope! Every expert was once a beginner! Use this as a learning opportunity to grow."
      return "This is a learning opportunity! Practice makes perfect! Focus on the areas for improvement and keep pushing forward."
    }
  
    if (isLoading) {
      return (
        <div className="bg-gradient-to-br from-amber-50/10 to-yellow-50/10 border border-amber-200/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400"></div>
            <span className="text-sm text-amber-200">Generating feedback...</span>
          </div>
        </div>
      )
    }
  
    return (
      <div className="bg-gradient-to-br from-amber-50/10 to-yellow-50/10 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/20 dark:border-amber-700/30 rounded-lg p-4">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-200 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full"></div>
            Motivational Feedback
          </h4>
          <p className="text-sm text-amber-600 dark:text-amber-100 leading-relaxed">{motivationalText}</p>
        </div>
      </div>
    )
  }