import { NextResponse } from "next/server"
import { API_CONFIG } from "@/config/api-config"

export async function GET() {
  try {
    // Log the URL we're trying to connect to
    console.log(`Checking model health at: ${API_CONFIG.baseUrl}/health`)

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/health`, {
        // Add a timeout to prevent hanging requests
        signal: AbortSignal.timeout(3000),
        // Ensure we're not using cached responses
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        console.error(`Backend health check failed with status: ${response.status}`)
        return NextResponse.json({
          loaded: false,
          error: `Backend health check failed with status: ${response.status}`,
          details: {
            url: API_CONFIG.baseUrl,
            status: response.status,
            statusText: response.statusText,
          },
        })
      }

      const data = await response.json()
      console.log("Health check response:", data)

      // Check for model_loaded or status.healthy
      const isModelLoaded = data.model_loaded === true || (data.status === "healthy" && data.model_loaded !== false)

      return NextResponse.json({
        loaded: isModelLoaded,
        status: data.status || "unknown",
        message: isModelLoaded ? "Model loaded successfully" : "Model not loaded",
        details: data,
      })
    } catch (error) {
      console.error("Error communicating with backend:", error)

      // Provide more detailed error information
      const errorMessage = error instanceof Error ? error.message : String(error)
      const isTimeout = errorMessage.includes("timeout") || errorMessage.includes("timed out")

      return NextResponse.json({
        loaded: false,
        error: `Failed to communicate with backend: ${errorMessage}`,
        details: {
          url: API_CONFIG.baseUrl,
          isTimeout: isTimeout,
          suggestion: isTimeout
            ? "The backend server might not be running or is on a different port"
            : "Check your network connection and backend server status",
        },
      })
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ loaded: false, error: "Failed to process request" }, { status: 500 })
  }
}
