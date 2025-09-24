import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const uploadUrlSchema = z.object({
  session_id: z.string().uuid(),
  filename: z.string().min(1),
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
    const { session_id, filename } = uploadUrlSchema.parse(body)

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("id")
      .eq("id", session_id)
      .eq("user_id", user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 })
    }

    // Generate unique file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filePath = `answers/${user.id}/${session_id}/${timestamp}_${sanitizedFilename}`

    // Create signed URL for upload
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("answers")
      .createSignedUploadUrl(filePath)

    if (signedUrlError) {
      console.error("Signed URL creation error:", signedUrlError)
      return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 })
    }

    // Return signed URL and required fields for frontend PUT request
    return NextResponse.json({
      uploadUrl: signedUrlData.signedUrl,
      token: signedUrlData.token,
      path: signedUrlData.path,
      fields: {
        // Additional fields that might be needed for the PUT request
        "Content-Type": "audio/webm", // Default, can be overridden by client
      },
    })
  } catch (error) {
    console.error("Upload URL error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
