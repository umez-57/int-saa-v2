// components/reference-answer.tsx
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileText, ChevronDown, ChevronUp } from "lucide-react"

interface ReferenceAnswerProps {
    question: string
    persona: string
    difficulty: string
    jobDescription: string
    feedbackInsights: string[]
    referenceAnswer?: string
  }
  
  export function ReferenceAnswer({ 
    question, 
    persona, 
    difficulty, 
    jobDescription, 
    feedbackInsights, 
    referenceAnswer 
  }: ReferenceAnswerProps) {
    // Create a unique cache key based on question content
    const cacheKey = `ref_answer_${question.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '_')}_${persona}_${difficulty}`
    
    const [answer, setAnswer] = useState(() => {
      // Check localStorage first, then use referenceAnswer prop
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey)
        if (cached) return cached
      }
      return referenceAnswer || ""
    })
    const [isLoading, setIsLoading] = useState(!answer)
    const [isExpanded, setIsExpanded] = useState(false)
  
    useEffect(() => {
      if (!answer) {
        fetchReferenceAnswer()
      }
    }, [question, persona, difficulty])
  
    const fetchReferenceAnswer = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`http://localhost:8000/feedback/reference-answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            persona,
            difficulty,
            job_description: jobDescription,
            feedback_insights: feedbackInsights
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          const referenceAnswer = data.reference_answer
          setAnswer(referenceAnswer)
          // Cache the answer in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(cacheKey, referenceAnswer)
          }
        }
      } catch (error) {
        console.error('Failed to fetch reference answer:', error)
        setAnswer("Reference answer temporarily unavailable. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
  
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span>Generating reference answer...</span>
        </div>
      )
    }
  
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reference Answer
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="text-xs bg-blue-500/10 border-blue-400/30 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400/50 hover:text-blue-100 transition-all duration-200 flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Show More
              </>
            )}
          </Button>
        </div>
        
        <div className={`transition-all duration-300 ${isExpanded ? 'max-h-none' : 'max-h-80 overflow-hidden'}`}>
          <div className="p-4 bg-gradient-to-br from-blue-50/10 to-indigo-50/10 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/20 dark:border-blue-700/30 rounded-lg">
            <div 
              className={`text-sm leading-relaxed prose prose-invert max-w-none ${isExpanded ? 'max-h-[500px] overflow-y-auto pr-2' : ''}`}
              dangerouslySetInnerHTML={{
                __html: answer
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-700 dark:text-blue-200 font-semibold">$1</strong>') // Bold text
                  .replace(/\*(.*?)\*/g, '<em class="text-blue-600 dark:text-blue-100">$1</em>') // Italic text
                  .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-blue-700 dark:text-blue-100">$1</h3>') // H3 headers
                  .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2 text-blue-700 dark:text-blue-100">$1</h2>') // H2 headers
                  .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2 text-blue-700 dark:text-blue-100">$1</h1>') // H1 headers
                  .replace(/^\d+\.\s(.*$)/gim, '<li class="ml-4 text-blue-600 dark:text-blue-50">$1</li>') // Numbered lists
                  .replace(/^-\s(.*$)/gim, '<li class="ml-4 list-disc text-blue-600 dark:text-blue-50">$1</li>') // Bullet lists
                  .replace(/\n\n/g, '</p><p class="text-blue-600 dark:text-blue-50">') // Paragraph breaks
                  .replace(/\n/g, '<br>') // Line breaks
                  .replace(/^(.*)$/gm, '<p class="text-blue-600 dark:text-blue-50">$1</p>') // Wrap in paragraphs
                  .replace(/<p><\/p>/g, '') // Remove empty paragraphs
              }}
            />
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          💡 This reference answer shows the expected structure and key points for this question
        </div>
      </div>
    )
  }