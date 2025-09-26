"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, ArrowLeft, Sun, Moon, User as UserIcon, Settings, ChevronDown, LogOut } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { EditProfileModal } from "@/components/edit-profile-modal"
import type { User } from "@supabase/supabase-js"

export default function HRUploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  
  const [resumeText, setResumeText] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isDark, setIsDark] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    setIsDark(theme === 'dark')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isProfileOpen && !target.closest('.profile-dropdown')) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileOpen])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/landing')
  }

  const handleProfileUpdate = async () => {
    // Refresh profile data after update
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          if (profileData) {
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    fetchUser()
  }, [supabase])

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

      {/* Custom Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 dark:bg-black/10 border-b border-white/20 dark:border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold">
                <span className="text-blue-600 dark:text-blue-400">Career</span>
                <span className="text-gray-900 dark:text-white">Prep</span>
                <span className="text-blue-600 dark:text-blue-400"> AI</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/25 dark:hover:bg-white/15 hover:text-blue-600 dark:hover:text-blue-400 hover:border-white/30 dark:hover:border-white/20 transition-all duration-300 backdrop-blur-sm font-medium">
                Dashboard
              </Link>
              <Link href="/history" className="px-4 py-2 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/25 dark:hover:bg-white/15 hover:text-blue-600 dark:hover:text-blue-400 hover:border-white/30 dark:hover:border-white/20 transition-all duration-300 backdrop-blur-sm font-medium">
                History
              </Link>
              <Link href="/landing" className="px-4 py-2 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/25 dark:hover:bg-white/15 hover:text-blue-600 dark:hover:text-blue-400 hover:border-white/30 dark:hover:border-white/20 transition-all duration-300 backdrop-blur-sm font-medium">
                Landing
              </Link>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/25 dark:hover:bg-white/15 hover:border-white/30 dark:hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                {isDark ? <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />}
              </button>
              
              {/* User Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/25 dark:hover:bg-white/15 hover:border-white/30 dark:hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                >
                  <UserIcon className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {profile?.name || profile?.preferred_name || 'User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-700 dark:text-gray-200 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/30 dark:border-slate-600/50 rounded-lg shadow-2xl z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false)
                          setIsEditModalOpen(true)
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-slate-700/70 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                      <div className="border-t border-gray-200 dark:border-slate-700 my-1"></div>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl px-6 py-12 pt-24 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/interview/new" 
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Interview Setup
          </Link>
        </div>

        {/* Main Card */}
        <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 dark:bg-blue-600/20 rounded-lg backdrop-blur-sm border border-blue-300 dark:border-blue-600">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              Upload Your Resume
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
              Upload your resume or CV so we can ask personalized questions about your experience and background.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Upload Resume (PDF)</span>
                <div className="mt-3">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:transition-all file:duration-300 file:cursor-pointer disabled:file:opacity-50 disabled:file:cursor-not-allowed"
                  />
                </div>
              </label>
              
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Upload className="w-4 h-4 animate-spin" />
                  Processing resume...
                </div>
              )}
            </div>

            {/* Manual Input */}
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Or describe your experience manually
                </span>
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Describe your work experience, projects, skills, and achievements..."
                  className="mt-3 min-h-[200px] bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 backdrop-blur-sm resize-none"
                />
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={handleContinue}
                disabled={!resumeText.trim() || isUploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        user={user}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  )
}

