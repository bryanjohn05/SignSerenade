//frontend/app/api/avail-signs/route.ts
import { NextResponse } from "next/server"
import { MODEL_SIGN_ACTIONS } from "@/config/api-config"

export async function GET() {
  try {
    // Return all signs from the SIGN_ACTIONS array
    // We're assuming all videos in the mapping are available
    return NextResponse.json({ signs: MODEL_SIGN_ACTIONS })
  } catch (error) {
    console.error("Error getting available signs:", error)
    return NextResponse.json({ signs: [], error: "Failed to get available signs" }, { status: 500 })
  }
}
