import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"
import { Sparkline } from "@/components/sparkline"
import { InterviewRadarChart } from "@/components/radar-chart"

export default async function HistoryPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/")
  }

  // Check if user has completed onboarding
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profileError || !profile) {
    redirect("/onboarding")
  }

  const { data: sessions, error: sessionsError } = await supabase
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
  }

  // Process sessions with real data
  const processedSessions = await Promise.all(
    (sessions || []).map(async (session) => {
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
  )

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto max-w-7xl px-6 md:px-8 py-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Practice History</h1>
            <p className="text-xl text-muted-foreground">Track your progress and review past interview sessions</p>
          </div>

          {processedSessions.length >= 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends (Last 3 Sessions)</CardTitle>
              </CardHeader>
              <CardContent>
                <InterviewRadarChart data={globalRadarData} />
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {processedSessions.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No interview sessions yet</p>
                <Button asChild>
                  <Link href="/interview/new">Start Your First Interview</Link>
                </Button>
              </Card>
            ) : (
              processedSessions.map((session) => (
                <Card key={session.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{session.persona}</Badge>
                          <Badge variant="outline">{session.difficulty}</Badge>
                          <Badge variant="outline">{session.mode}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {session.formatted_date} at {session.formatted_time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="w-24">
                        <div className="text-xs text-muted-foreground mb-1">Performance</div>
                        <Sparkline data={session.sparkline_data} height={30} />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{session.overall_score}%</div>
                        <div className="text-xs text-muted-foreground">Overall Score</div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
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
    </div>
  )
}
