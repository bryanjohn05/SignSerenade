import { NextResponse } from "next/server"
import { API_CONFIG } from "@/config/api-config"

export async function GET() {
  try {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.quiz}`)

      if (!response.ok) {
        console.error(`Backend returned status: ${response.status}`)
        // Return empty quiz data instead of throwing
        return NextResponse.json({ sign: "", video_path: "", quiz_options: [] })
      }

      // Try to parse as JSON, but handle HTML responses gracefully
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        console.error(`Backend returned non-JSON content type: ${contentType}`)
        // Return empty quiz data for non-JSON responses
        return NextResponse.json({ sign: "", video_path: "", quiz_options: [] })
      }
    } catch (error) {
      console.error("Error communicating with backend:", error)
      return NextResponse.json({ sign: "", video_path: "", quiz_options: [] })
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
