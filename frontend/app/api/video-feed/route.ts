import { NextResponse } from "next/server"
import { API_CONFIG } from "@/config/api-config"

export async function GET() {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/video_feed`)

    if (!response.ok) {
      return new NextResponse(null, { status: response.status, statusText: response.statusText })
    }

    // Forward the response headers and body
    const headers = new Headers(response.headers)
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    headers.set("Pragma", "no-cache")
    headers.set("Expires", "0")
    headers.set("Access-Control-Allow-Origin", "*")

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  } catch (error) {
    console.error("Error proxying video feed:", error)
    return NextResponse.json({ error: "Failed to proxy video feed" }, { status: 500 })
  }
}
