"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, Brain, Target, Play, ArrowRight, BarChart3, History } from "lucide-react"
import { Sparkline } from "@/components/sparkline"
import { InterviewRadarChart } from "@/components/radar-chart"
import type { User } from "@supabase/supabase-js"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-6 md:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {profile.preferred_name || profile.full_name} 👋</h1>
            <p className="text-muted-foreground">Keep up the momentum. Practice today to improve your score.</p>
          </div>
        </div>

        {/* Top Row: Quick Actions + Summary */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump in where you’ll get the most benefit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <Button className="h-24 justify-start flex-col items-start gap-2" onClick={() => window.location.href = '/interview/new'}>
                  <div className="flex items-center gap-2 text-base font-medium"><Target className="w-4 h-4" /> Mock Interview</div>
                  <div className="text-xs text-white/80">AI interviewer, voice answers, instant scoring</div>
                </Button>
                <Button variant="outline" className="h-24 justify-start flex-col items-start gap-2" onClick={() => window.location.href = '/system-design/new'}>
                  <div className="flex items-center gap-2 text-base font-medium"><Brain className="w-4 h-4" /> System Design</div>
                  <div className="text-xs text-muted-foreground">High-level design prompts and critique</div>
                </Button>
                <Button variant="outline" className="h-24 justify-start flex-col items-start gap-2" onClick={() => window.location.href = '/coding/new'}>
                  <div className="flex items-center gap-2 text-base font-medium"><Code className="w-4 h-4" /> Core CS Concepts</div>
                  <div className="text-xs text-muted-foreground">Conceptual CS across DSA, OS, DB, Networks, OOP</div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Performance Summary</CardTitle>
              <CardDescription>Recent score trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <Sparkline data={recentScores.length ? recentScores : [0]} />
              </div>
              <div className="text-sm text-muted-foreground">Last 7 answers • Avg {recentScores.length ? Math.round(recentScores.reduce((a,b)=>a+b,0)/recentScores.length) : 0}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Recent Sessions + Radar */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Sessions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="w-5 h-5" /> Recent Sessions</CardTitle>
              <CardDescription>Your latest interviews and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {recentSessions.length === 0 ? (
                  <div className="py-6 text-sm text-muted-foreground">No sessions yet. Start your first interview to see progress here.</div>
                ) : (
                  recentSessions.map((s) => (
                    <div key={s.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{s.persona?.toUpperCase()} Interview</div>
                        <div className="text-xs text-muted-foreground">Status: {s.status || '—'} • {s.formatted_date}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold">{s.overall_score}%</div>
                        <Button size="sm" variant="outline" onClick={() => window.location.href = `/interview/${s.id}/summary`}>
                          View
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle>Skills Snapshot</CardTitle>
              <CardDescription>Where you’re strongest, and what to improve</CardDescription>
            </CardHeader>
            <CardContent>
              <InterviewRadarChart data={radarData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
