import { NextResponse } from "next/server"
import { API_CONFIG } from "@/config/api-config"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/classify_action`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        console.error(`Backend returned status: ${response.status}`)
        return NextResponse.json({ action: "Unknown", confidence: 0 })
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error("Error communicating with backend:", error)
      return NextResponse.json({ action: "Unknown", confidence: 0 })
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
