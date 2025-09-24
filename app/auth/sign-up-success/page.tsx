"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to profile completion after 3 seconds
    const timer = setTimeout(() => {
      router.push("/profile-complete")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <CardTitle className="text-2xl font-bold">Account Created!</CardTitle>
            <CardDescription>Redirecting to profile setup...</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Please complete your profile to get started with personalized interview practice.
            </p>
            <div className="mt-4 text-center">
              <button 
                onClick={() => router.push("/profile-complete")}
                className="text-primary hover:underline text-sm"
              >
                Complete Profile Now →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
