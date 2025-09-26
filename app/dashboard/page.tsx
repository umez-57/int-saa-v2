"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, Brain, Target, Play, ArrowRight, BarChart3, History, Sun, Moon, LogOut, User as UserIcon, Settings, ChevronDown } from "lucide-react"
import { Sparkline } from "@/components/sparkline"
import { InterviewRadarChart } from "@/components/radar-chart"
import { EditProfileModal } from "@/components/edit-profile-modal"
import { motion } from "framer-motion"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
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
  
  // Charts/session data hooks must be declared before any return to keep hook order stable
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [recentScores, setRecentScores] = useState<number[]>([])

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)

      // Check if user has completed onboarding
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profileError || !profileData) {
        router.push("/onboarding")
        return
      }

      // Check if profile is completed
      if (!profileData.profile_completed) {
        router.push("/profile-complete")
        return
      }

      setProfile(profileData)
      setLoading(false)
    }

    getUser()
  }, [supabase, router])

  // Fetch recent sessions + answers for charts once user is known
  useEffect(() => {
    const fetchRecent = async () => {
      if (!user?.id) return
      try {
        const { data: sessions, error } = await supabase
          .from("interview_sessions")
          .select(`
            id, persona, difficulty, mode, status, created_at,
            answers:interview_answers(score, evaluation, created_at)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (!error && sessions) {
          const processed = sessions.map((s: any) => {
            const answers = s.answers || []
            const averageScore = answers.length > 0
              ? Math.round(answers.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / answers.length)
              : 0
            return {
              ...s,
              overall_score: averageScore,
              sparkline_data: answers.length > 0 ? answers.map((a: any) => a.score || 0) : [0],
              formatted_date: new Date(s.created_at).toLocaleDateString(),
            }
          })

          setRecentSessions(processed)
          setRecentScores(processed.flatMap((p: any) => p.sparkline_data).slice(-7))
        }
      } catch (e) {
        console.error("Dashboard recent fetch failed", e)
      }
    }

    fetchRecent()
  }, [supabase, user?.id])

  // Build radar metrics from last three sessions similar to history page
  const radarData = useMemo(() => {
    const lastThree = recentSessions.slice(0, 3)
    if (lastThree.length === 0) {
      return [
        { dimension: "Content", score: 0 },
        { dimension: "Structure", score: 0 },
        { dimension: "Tone", score: 0 },
        { dimension: "Clarity", score: 0 },
        { dimension: "Timing", score: 0 },
      ]
    }

    const allAnswers = lastThree.flatMap((s: any) => s.answers || [])
    if (allAnswers.length === 0) {
      return [
        { dimension: "Content", score: 0 },
        { dimension: "Structure", score: 0 },
        { dimension: "Tone", score: 0 },
        { dimension: "Clarity", score: 0 },
        { dimension: "Timing", score: 0 },
      ]
    }

    const avgScore = Math.round(allAnswers.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / allAnswers.length)
    const clarityScores = allAnswers
      .map((a: any) => a.evaluation?.clarity_score)
      .filter((v: any) => v !== undefined && v !== null)
    const avgClarity = clarityScores.length > 0
      ? Math.round((clarityScores.reduce((s: number, v: number) => s + v, 0) / clarityScores.length) * 100)
      : avgScore

    return [
      { dimension: "Content", score: avgScore },
      { dimension: "Structure", score: Math.max(0, avgScore - 3) },
      { dimension: "Tone", score: Math.max(0, avgScore + 2) },
      { dimension: "Clarity", score: avgClarity },
      { dimension: "Timing", score: Math.max(0, avgScore - 4) },
    ]
  }, [recentSessions])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top left gradient blur */}
        <div className={`absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30' 
            : 'bg-gradient-to-br from-blue-400/35 to-purple-400/35'
        }`} style={{filter: 'blur(120px)'}}></div>
        
        {/* Top right gradient blur */}
        <div className={`absolute -top-20 -right-20 w-[600px] h-[600px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-bl from-purple-500/30 to-indigo-500/30' 
            : 'bg-gradient-to-bl from-purple-400/35 to-indigo-400/35'
        }`} style={{filter: 'blur(120px)'}}></div>
        
        {/* Center gradient for more depth */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-r from-indigo-500/25 to-blue-500/25' 
            : 'bg-gradient-to-r from-indigo-400/30 to-blue-400/30'
        }`} style={{filter: 'blur(100px)'}}></div>
        
        {/* Additional bottom left gradient */}
        <div className={`absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-tr from-blue-600/20 to-cyan-500/20' 
            : 'bg-gradient-to-tr from-blue-400/25 to-cyan-400/25'
        }`} style={{filter: 'blur(80px)'}}></div>
        
        {/* Additional bottom right gradient */}
        <div className={`absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-tl from-purple-600/20 to-pink-500/20' 
            : 'bg-gradient-to-tl from-purple-400/25 to-pink-400/25'
        }`} style={{filter: 'blur(80px)'}}></div>
      </div>

      {/* Glassmorphic Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/15 dark:bg-black/15 border-b border-white/30 dark:border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-white/10 to-purple-500/5 dark:from-blue-400/5 dark:via-white/10 dark:to-purple-400/5"></div>
        <div className="absolute inset-0 border border-transparent bg-gradient-to-r from-blue-200/20 via-transparent to-purple-200/20 dark:from-blue-400/10 dark:via-transparent dark:to-purple-400/10 rounded-none" style={{backgroundClip: 'padding-box'}}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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
                    {profile.name || profile.preferred_name || 'User'}
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
      <div className="container mx-auto max-w-7xl px-6 md:px-8 py-10 pt-24 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, <span className="text-blue-600 dark:text-blue-400">{profile.name || profile.preferred_name || 'User'}</span> 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Keep up the momentum. Practice today to improve your score.</p>
          </div>
        </div>

        {/* Top Row: Quick Actions + Summary */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-white/30 dark:border-slate-600/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Jump in where you'll get the most benefit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
               <Button
                 className="h-24 p-4 justify-start flex-col items-start gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                 onClick={() => (window.location.href = '/interview/new')}
               >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Target className="w-4 h-4 flex-shrink-0" />
                  <span>Mock Interview</span>
                </div>
                <div className="text-xs text-white/90 break-words whitespace-normal">
                  AI interviewer, voice answers, instant scoring
                </div>
              </Button>
               <Button
                   variant="outline"
                   className="h-24 p-4 justify-start flex-col items-start gap-2 bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600/70 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300"
                   onClick={() => (window.location.href = '/system-design/new')}
                 >
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <Brain className="w-4 h-4 flex-shrink-0" />
                    <span>System Design</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 break-words whitespace-normal">
                    High-level design prompts and critique
                  </div>
                </Button>

                 <Button
                   variant="outline"
                   className="h-24 p-4 justify-start flex-col items-start gap-2 bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600/70 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300"
                   onClick={() => (window.location.href = '/coding/new')}
                 >
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <Code className="w-4 h-4 flex-shrink-0" />
                    <span>Core CS Concepts</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 break-words whitespace-normal">
                    Conceptual CS across DSA, OS, DB, Networks, OOP
                  </div>
                </Button>

              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-white/30 dark:border-slate-600/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Performance Summary
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Recent score trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <Sparkline 
                  data={recentScores.length ? recentScores : [0]} 
                  color="#2563eb" 
                  height={50}
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Last 7 answers • Avg <span className="font-semibold text-blue-600 dark:text-blue-400">{recentScores.length ? Math.round(recentScores.reduce((a,b)=>a+b,0)/recentScores.length) : 0}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Recent Sessions + Radar */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Sessions */}
          <Card className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-white/30 dark:border-slate-600/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <History className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Recent Sessions
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Your latest interviews and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {recentSessions.length === 0 ? (
                  <div className="py-6 text-sm text-gray-600 dark:text-gray-400">No sessions yet. Start your first interview to see progress here.</div>
                ) : (
                  recentSessions.map((s) => {
                    // Score color logic
                    const getScoreColor = (score: number) => {
                      if (score >= 70) return {
                        bg: 'bg-green-50 dark:bg-green-900/30',
                        text: 'text-green-600 dark:text-green-400',
                        border: 'border-green-200 dark:border-green-700'
                      }
                      if (score >= 40) return {
                        bg: 'bg-yellow-50 dark:bg-yellow-900/30',
                        text: 'text-yellow-600 dark:text-yellow-400',
                        border: 'border-yellow-200 dark:border-yellow-700'
                      }
                      return {
                        bg: 'bg-red-50 dark:bg-red-900/30',
                        text: 'text-red-600 dark:text-red-400',
                        border: 'border-red-200 dark:border-red-700'
                      }
                    }

                    // Status color logic
                    const getStatusColor = (status: string) => {
                      if (status === 'completed') return {
                        bg: 'bg-green-50 dark:bg-green-900/30',
                        text: 'text-green-600 dark:text-green-400',
                        border: 'border-green-200 dark:border-green-700'
                      }
                      if (status === 'in_progress') return {
                        bg: 'bg-yellow-50 dark:bg-yellow-900/30',
                        text: 'text-yellow-600 dark:text-yellow-400',
                        border: 'border-yellow-200 dark:border-yellow-700'
                      }
                      return {
                        bg: 'bg-gray-50 dark:bg-gray-900/30',
                        text: 'text-gray-600 dark:text-gray-400',
                        border: 'border-gray-200 dark:border-gray-700'
                      }
                    }

                    // Interview type color logic
                    const getInterviewTypeColor = (persona: string) => {
                      const type = persona?.toLowerCase()
                      if (type === 'tech') return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-700'
                      if (type === 'hr') return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-md border border-purple-200 dark:border-purple-700'
                      if (type === 'system') return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md border border-indigo-200 dark:border-indigo-700'
                      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700'
                    }

                    const scoreColors = getScoreColor(s.overall_score)
                    const statusColors = getStatusColor(s.status)

                    return (
                      <div key={s.id} className="py-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            <span className={`inline-block font-semibold ${getInterviewTypeColor(s.persona)}`}>
                              {s.persona?.toUpperCase() || 'INTERVIEW'}
                            </span>
                            <span className="ml-2">Interview</span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <span>Status:</span>
                            <span className={`inline-block px-2 py-1 rounded-md font-medium border backdrop-blur-sm ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                              {s.status === 'in_progress' ? 'In Progress' : 
                               s.status === 'completed' ? 'Completed' : 
                               s.status || 'Pending'}
                            </span>
                            <span>•</span>
                            <span>{s.formatted_date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`text-sm font-semibold px-3 py-2 rounded-lg border backdrop-blur-sm shadow-sm ${scoreColors.bg} ${scoreColors.text} ${scoreColors.border}`}>
                            {s.overall_score}%
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-white/50 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600/70 hover:border-blue-400 dark:hover:border-blue-500 text-gray-900 dark:text-white transition-all duration-300"
                            onClick={() => window.location.href = `/interview/${s.id}/summary`}
                          >
                            View
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills Snapshot */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-white/30 dark:border-slate-600/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Skills Snapshot</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Where you're strongest, and what to improve</CardDescription>
            </CardHeader>
            <CardContent>
              <InterviewRadarChart data={radarData} />
            </CardContent>
          </Card>
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
