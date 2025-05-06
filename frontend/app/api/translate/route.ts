//frontend/app/api/translate/route.ts
import { NextResponse } from "next/server"
import { API_CONFIG } from "@/config/api-config"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const formData = new FormData()
    formData.append("input_text", text)

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.translate}`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        console.error(`Backend returned status: ${response.status}`)
        // Return empty videos array instead of throwing
        return NextResponse.json({ videos: [] })
      }

      // Try to parse as JSON, but handle HTML responses gracefully
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        console.error(`Backend returned non-JSON content type: ${contentType}`)
        // Return empty videos array for non-JSON responses
        return NextResponse.json({ videos: [] })
      }
    } catch (error) {
      console.error("Error communicating with backend:", error)
      return NextResponse.json({ videos: [] })
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
