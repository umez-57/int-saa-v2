"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { useRouter } from "next/navigation"
import { ProfileDropdown } from "@/components/profile-dropdown"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Fetch profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        setProfile(profileData)
      }
      
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Fetch profile data when user changes
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
        setProfile(profileData)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    try {
      console.log("Logging out user...")
      await supabase.auth.signOut()
      console.log("User logged out successfully")
      router.push("/")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      console.log("Refreshing profile data...")
      // Small delay to ensure database has updated
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      setProfile(profileData)
      console.log("Profile data refreshed:", profileData)
    }
  }

  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <User className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  if (!user) {
    return (
      <Button variant="ghost" onClick={() => router.push("/auth/login")}>
        Sign In
      </Button>
    )
  }


  return (
    <ProfileDropdown 
      user={user} 
      profile={profile} 
      onLogout={handleLogout}
      onProfileUpdate={refreshProfile}
    />
  )
}
