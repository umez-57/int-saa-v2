import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { conversation_id, text } = await request.json()

    if (!conversation_id || !text) {
      return NextResponse.json(
        { error: "conversation_id and text are required" },
        { status: 400 }
      )
    }

    // Call backend echo endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/tavus/conversation/${conversation_id}/echo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App)'
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: `Backend error: ${errorData.detail || 'Unknown error'}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error("[Tavus Echo] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}






