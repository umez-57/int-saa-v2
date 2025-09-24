import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const endSchema = z.object({
  conversation_id: z.string(),
  delete: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversation_id, delete: shouldDelete } = endSchema.parse(body)

    const apiKey = process.env.TAVUS_API_KEY
    const baseUrl = process.env.TAVUS_BASE_URL || "https://tavusapi.com"
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Tavus API key" }, { status: 500 })
    }

    // End the conversation first
    const endRes = await fetch(`${baseUrl}/v2/conversations/${conversation_id}/end`, {
      method: "POST",
      headers: { "x-api-key": apiKey },
    })

    if (!endRes.ok) {
      const text = await endRes.text()
      console.error("[Tavus] End conversation failed:", endRes.status, text)
      // Continue to delete attempt only if explicitly requested and end fails? We'll stop here.
      return NextResponse.json({ error: "Failed to end conversation" }, { status: 502 })
    }

    let deleted = false
    if (shouldDelete) {
      const delRes = await fetch(`${baseUrl}/v2/conversations/${conversation_id}`, {
        method: "DELETE",
        headers: { "x-api-key": apiKey },
      })
      deleted = delRes.ok
      if (!delRes.ok) {
        const text = await delRes.text()
        console.error("[Tavus] Delete conversation failed:", delRes.status, text)
      }
    }

    return NextResponse.json({ ok: true, ended: true, deleted })
  } catch (err) {
    console.error("[Tavus] Error ending conversation:", err)
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}



