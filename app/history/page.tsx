"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Sun, Moon, LogOut, User as UserIcon, Settings, ChevronDown, ArrowLeft, BarChart3, History } from "lucide-react"
import Link from "next/link"
import { Sparkline } from "@/components/sparkline"
import { InterviewRadarChart } from "@/components/radar-chart"
import { EditProfileModal } from "@/components/edit-profile-modal"
import type { User } from "@supabase/supabase-js"

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const router = useRouter()
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
    const fetchData = async () => {
      try {
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push("/auth/login")
          return
        }
        setUser(user)

        // Check if user has completed onboarding
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError || !profile) {
          router.push("/onboarding")
          return
        }
        setProfile(profile)

        // Fetch sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from("interview_sessions")
          .select(`
            *,
            answers:interview_answers(
              score,
              evaluation,
              created_at
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (sessionsError) {
          console.error("Error fetching sessions:", sessionsError)
        } else {
          setSessions(sessionsData || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  // Process sessions with real data
  const processedSessions = sessions.map((session) => {
    const answers = session.answers || []
    
    // Calculate real average score using the score field
    const averageScore = answers.length > 0 
      ? Math.round(answers.reduce((sum: number, answer: any) => sum + (answer.score || 0), 0) / answers.length)
      : 0

    // Generate sparkline data from actual scores
    const sparklineData = answers.length > 0 
      ? answers.map((answer: any) => answer.score || 0)
      : [0]

    return {
      ...session,
      overall_score: averageScore,
      sparkline_data: sparklineData,
      formatted_date: new Date(session.created_at).toLocaleDateString(),
      formatted_time: new Date(session.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      answers: answers
    }
  })

  // Generate radar chart data from last 3 sessions
  const lastThreeSessions = processedSessions.slice(0, 3)
  let globalRadarData = [
    { dimension: "Content", score: 0 },
    { dimension: "Structure", score: 0 },
    { dimension: "Tone", score: 0 },
    { dimension: "Clarity", score: 0 },
    { dimension: "Timing", score: 0 },
  ]

  if (lastThreeSessions.length > 0) {
    // Calculate average scores for each dimension across all answers from last 3 sessions
    const allAnswers = lastThreeSessions.flatMap(session => session.answers || [])
    
    if (allAnswers.length > 0) {
      // Calculate average score from actual data
      const avgScore = Math.round(allAnswers.reduce((sum: number, answer: any) => sum + (answer.score || 0), 0) / allAnswers.length)
      
      // Calculate clarity score from evaluation data if available
      const clarityScores = allAnswers
        .map((answer: any) => answer.evaluation?.clarity_score)
        .filter(score => score !== undefined && score !== null)
      
      const avgClarity = clarityScores.length > 0 
        ? Math.round(clarityScores.reduce((sum: number, score: number) => sum + score, 0) / clarityScores.length * 100)
        : avgScore
      
      // Generate radar chart data based on actual performance
      globalRadarData = [
        { dimension: "Content", score: avgScore },
        { dimension: "Structure", score: Math.max(0, avgScore - 3) },
        { dimension: "Tone", score: Math.max(0, avgScore + 2) },
        { dimension: "Clarity", score: avgClarity },
        { dimension: "Timing", score: Math.max(0, avgScore - 4) },
      ]
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your practice history...</p>
        </div>
      </div>
    )
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
              <Link href="/history" className="px-4 py-2 rounded-lg bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700 transition-all duration-300 backdrop-blur-sm font-medium">
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

      <div className="container mx-auto max-w-7xl px-6 md:px-8 py-12 pt-24 relative z-10">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Practice History</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Track your progress and review past interview sessions</p>
          </div>

          {/* Performance Trends */}
          {processedSessions.length >= 3 && (
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="p-2 bg-blue-500/20 dark:bg-blue-600/20 rounded-lg backdrop-blur-sm border border-blue-300 dark:border-blue-600">
                    <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Performance Trends (Last 3 Sessions)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InterviewRadarChart data={globalRadarData} />
              </CardContent>
            </Card>
          )}

          {/* Sessions List */}
          <div className="space-y-4">
            {processedSessions.length === 0 ? (
              <Card className="p-8 text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-lg">
                <div className="p-4 bg-blue-500/20 dark:bg-blue-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <History className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">No interview sessions yet</p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/interview/new">Start Your First Interview</Link>
                </Button>
              </Card>
            ) : (
              processedSessions.map((session) => (
                <Card key={session.id} className="p-6 hover:shadow-lg transition-all duration-300 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-2 border-gray-300 dark:border-slate-600 shadow-lg hover:border-blue-400 dark:hover:border-blue-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={`${
                              session.persona === 'tech' 
                                ? 'bg-blue-600 text-white border-0' 
                                : session.persona === 'hr' 
                                ? 'bg-purple-600 text-white border-0'
                                : 'bg-indigo-600 text-white border-0'
                            }`}
                          >
                            {session.persona?.toUpperCase()}
                          </Badge>
                          <Badge 
                            className={`${
                              session.difficulty === 'junior' 
                                ? 'bg-green-600 text-white border-0' 
                                : session.difficulty === 'mid' 
                                ? 'bg-yellow-600 text-white border-0'
                                : 'bg-red-600 text-white border-0'
                            }`}
                          >
                            {session.difficulty?.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300">
                            {session.mode}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {session.formatted_date} at {session.formatted_time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="w-24">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Performance</div>
                        <Sparkline data={session.sparkline_data} height={30} />
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          session.overall_score >= 70 
                            ? 'text-green-600 dark:text-green-400' 
                            : session.overall_score >= 40 
                            ? 'text-yellow-600 dark:text-yellow-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {session.overall_score}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Overall Score</div>
                      </div>
                      <Button variant="outline" size="sm" asChild className="border-2 border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                        <Link href={`/interview/${session.id}/summary`} className="gap-2">
                          <Eye className="w-4 h-4" />
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
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
