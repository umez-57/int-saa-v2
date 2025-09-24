// components/job-description-input.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, X } from "lucide-react"

interface JobDescriptionInputProps {
  onJobDescriptionChange: (description: string) => void
  initialDescription?: string
  persona: string
  difficulty: string
}

export function JobDescriptionInput({ 
  onJobDescriptionChange, 
  initialDescription = "",
  persona,
  difficulty 
}: JobDescriptionInputProps) {
  const [description, setDescription] = useState(initialDescription)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = () => {
    if (description.trim()) {
      onJobDescriptionChange(description.trim())
      setIsExpanded(false)
    }
  }

  const handleClear = () => {
    setDescription("")
    onJobDescriptionChange("")
  }

  const getPersonaDescription = (persona: string) => {
    switch (persona.toLowerCase()) {
      case 'hr':
        return "HR roles focus on people management, policies, and organizational development"
      case 'tech':
        return "Technical roles require specific skills, technologies, and problem-solving abilities"
      case 'behavioral':
        return "Behavioral interviews assess soft skills, leadership, and cultural fit"
      default:
        return "General interview preparation"
    }
  }

  const getDifficultyDescription = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'junior':
        return "Entry-level questions focusing on fundamentals and learning potential"
      case 'mid':
        return "Mid-level questions requiring experience and practical knowledge"
      case 'senior':
        return "Senior-level questions testing leadership, strategy, and expertise"
      default:
        return "Appropriate difficulty level"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Job Description
          {description && (
            <Badge variant="secondary" className="ml-auto">
              Customized
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isExpanded && !description ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Personalize Your Interview</h3>
            <p className="text-muted-foreground mb-4">
              Add a job description to get questions tailored to your specific role and requirements.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Current Setup:</strong> {getPersonaDescription(persona)}</p>
              <p><strong>Difficulty:</strong> {getDifficultyDescription(difficulty)}</p>
            </div>
            <Button 
              onClick={() => setIsExpanded(true)}
              className="mt-4"
            >
              <Upload className="h-4 w-4 mr-2" />
              Add Job Description
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="job-description">Job Description</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? "Collapse" : "Edit"}
                </Button>
                {description && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {isExpanded ? (
              <div className="space-y-4">
                <Textarea
                  id="job-description"
                  placeholder="Paste the job description here to get personalized questions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={!description.trim()}>
                    Apply Job Description
                  </Button>
                  <Button variant="outline" onClick={() => setIsExpanded(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {description}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

