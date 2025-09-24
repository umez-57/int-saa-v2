import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    console.log("[Tavus] Received event:", body)

    // Handle different event types
    switch (body.event_type) {
      case "utterance":
        // Log when user or replica speaks
        console.log("[Tavus] Utterance:", {
          speaker: body.speaker,
          text: body.text,
          timestamp: body.timestamp
        })
        break

      case "replica_started_speaking":
        console.log("[Tavus] Replica started speaking")
        break

      case "replica_stopped_speaking":
        console.log("[Tavus] Replica stopped speaking")
        break

      case "conversation_ended":
        console.log("[Tavus] Conversation ended")
        break

      default:
        console.log("[Tavus] Unknown event type:", body.event_type)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Tavus events handler error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
