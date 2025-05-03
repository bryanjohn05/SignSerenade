import { NextResponse } from "next/server"
import { API_CONFIG } from "@/config/api-config"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/detect`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        console.error(`Backend returned status: ${response.status}`)
        // Return empty detections array instead of throwing
        return NextResponse.json({ success: false, detections: [] })
      }

      // Try to parse as JSON
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        console.error(`Backend returned non-JSON content type: ${contentType}`)
        // Return empty detections for non-JSON responses
        return NextResponse.json({ success: false, detections: [] })
      }
    } catch (error) {
      console.error("Error communicating with backend:", error)
      return NextResponse.json({ success: false, detections: [] })
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
