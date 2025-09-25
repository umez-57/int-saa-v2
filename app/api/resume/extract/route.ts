import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const extractSchema = z.object({
  resume_file: z.string(), // base64 encoded file
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resume_file } = extractSchema.parse(body)

    // Call backend to extract text from resume
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    
    console.log(`[Resume Extract] Calling backend: ${backendUrl}/resume/extract`)
    
    const response = await fetch(`${backendUrl}/resume/extract`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App)'
      },
      body: JSON.stringify({ resume_file })
    })
    
    console.log(`[Resume Extract] Backend response status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`[Resume Extract] Success: ${data.success}`)
      return NextResponse.json({
        ok: true,
        resume_text: data.extracted_text
      })
    } else {
      const errorText = await response.text()
      console.error(`[Resume Extract] Backend error: ${errorText}`)
      throw new Error(`Backend responded with status: ${response.status} - ${errorText}`)
    }

  } catch (error) {
    console.error("Resume extraction error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Resume extraction failed" }, { status: 500 })
  }
}
