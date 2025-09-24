import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const interruptSchema = z.object({
  conversation_id: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { conversation_id } = interruptSchema.parse(body)

    const tavusApiKey = process.env.TAVUS_API_KEY
    const tavusBaseUrl = process.env.TAVUS_BASE_URL || "https://tavusapi.com"

    if (!tavusApiKey) {
      return NextResponse.json({ error: "Tavus configuration missing" }, { status: 500 })
    }

    console.log("[Tavus] Interrupting conversation:", conversation_id)

    // Call Tavus interrupt API
    const tavusResponse = await fetch(`${tavusBaseUrl}/conversations/${conversation_id}/interrupt`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tavusApiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!tavusResponse.ok) {
      const errorText = await tavusResponse.text()
      console.error("Tavus interrupt API error:", errorText)
      return NextResponse.json({ error: "Failed to interrupt Tavus conversation" }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: "Conversation interrupted successfully",
    })
  } catch (error) {
    console.error("Tavus interrupt error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
