"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function HRUploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  
  const [resumeText, setResumeText] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError("")

    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        const base64Data = base64.split(',')[1] // Remove data:application/pdf;base64, prefix

        // Call resume extraction API
        const response = await fetch('/api/resume/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resume_file: base64Data })
        })

        if (response.ok) {
          const data = await response.json()
          setResumeText(data.resume_text)
        } else {
          setError("Failed to extract text from resume. Please try again.")
        }
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError("Error processing resume file.")
      setIsUploading(false)
    }
  }

  const handleContinue = async () => {
    if (!resumeText.trim()) {
      setError("Please upload a resume or enter your experience manually.")
      return
    }

    if (!sessionId) {
      setError("Session ID not found. Please try again.")
      return
    }

    try {
      // Save resume text to session
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: sessionId,
          resume_text: resumeText 
        })
      })

      if (response.ok) {
        // Redirect to interview room
        router.push(`/interview/${sessionId}`)
      } else {
        setError("Failed to save resume. Please try again.")
      }
    } catch (err) {
      setError("Error saving resume. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/interview/new" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Interview Setup
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Upload Your Resume
            </CardTitle>
            <CardDescription>
              Upload your resume or CV so we can ask personalized questions about your experience and background.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Upload Resume (PDF)</span>
                <div className="mt-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </label>
              
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Upload className="w-4 h-4 animate-spin" />
                  Processing resume...
                </div>
              )}
            </div>

            {/* Manual Input */}
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Or describe your experience manually
                </span>
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Describe your work experience, projects, skills, and achievements..."
                  className="mt-2 min-h-[200px]"
                />
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={handleContinue}
                disabled={!resumeText.trim() || isUploading}
                className="flex-1"
              >
                Continue to Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

