// app/api/tavus/create-conversation/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Return mock response immediately - no API calls
  return NextResponse.json({
    conversation_id: "mock-conversation-123",
    conversation_url: "mock://tavus-avatar",
    status: "created",
    mock: true
  })
}