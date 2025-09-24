import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const profileCompleteSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  age: z.string().optional(),
  experienceLevel: z.enum(["Student", "Fresher", "1-3y", "3-5y", "5+y"]).optional(),
  role: z.string().optional(),
  targetTrack: z.enum(["SDE-1", "Applied-ML", "Data", "Product"]).optional(),
  personaPref: z.enum(["HR", "Tech", "Behavioral"]).optional(),
  timezone: z.string().optional(),
  goals: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = profileCompleteSchema.parse(body)

    // Update profile with completion status
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name: `${validatedData.firstName.trim()} ${validatedData.lastName.trim()}`,
        preferred_name: validatedData.firstName.trim(),
        experience_level: validatedData.experienceLevel || null,
        role: validatedData.role || null,
        target_track: validatedData.targetTrack || null,
        persona_pref: validatedData.personaPref || null,
        timezone: validatedData.timezone || null,
        goals: validatedData.goals || null,
        profile_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating profile:", updateError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Profile completed successfully" 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid input data", 
        details: error.errors 
      }, { status: 400 })
    }

    console.error("Profile completion error:", error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}

