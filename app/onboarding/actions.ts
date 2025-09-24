"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  preferred_name: z.string().optional(),
  experience_level: z.enum(["Student", "Fresher", "1-3y", "3-5y", "5+y"]),
  role: z.string().min(1, "Role is required"),
  target_track: z.enum(["SDE-1", "Applied-ML", "Data", "Product"]),
  persona_pref: z.enum(["HR", "Tech", "Behavioral"]),
  timezone: z.string().min(1, "Timezone is required"),
  goals: z.string().min(1, "Goals are required"),
})

export async function saveProfile(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Validate form data
  const rawData = {
    full_name: formData.get("full_name") as string,
    preferred_name: (formData.get("preferred_name") as string) || null,
    experience_level: formData.get("experience_level") as string,
    role: formData.get("role") as string,
    target_track: formData.get("target_track") as string,
    persona_pref: formData.get("persona_pref") as string,
    timezone: formData.get("timezone") as string,
    goals: formData.get("goals") as string,
  }

  const validatedData = profileSchema.parse(rawData)

  // Upsert profile
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    ...validatedData,
    profile_completed: true,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    throw new Error(`Failed to save profile: ${error.message}`)
  }

  // Redirect to profile completion page
  redirect("/profile-complete")
}
