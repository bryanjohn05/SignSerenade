//frontend/app/api/detect-signs/route.ts
import { NextResponse } from "next/server"
import { API_CONFIG } from "@/config/api-config"

export async function POST(request: Request) {
  try {
    const landmarkData = await request.json()

    // Send the landmark data to your backend model
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/detect-sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(landmarkData),
      })

      if (!response.ok) {
        console.error(`Backend returned status: ${response.status}`)
        return NextResponse.json({
          success: false,
          sign: "Error detecting sign",
          error: `Backend returned status: ${response.status}`,
        })
      }

      // Parse the response from your backend
      const data = await response.json()
      return NextResponse.json({
        success: true,
        sign: data.sign || "Unknown sign",
        confidence: data.confidence || 0,
        details: data.details || {},
      })
    } catch (error) {
      console.error("Error communicating with backend:", error)
      return NextResponse.json({
        success: false,
        sign: "Connection error",
        error: "Failed to connect to backend service",
      })
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json(
      {
        success: false,
        sign: "Processing error",
        error: "Failed to process request",
      },
      { status: 500 },
    )
  }
}
