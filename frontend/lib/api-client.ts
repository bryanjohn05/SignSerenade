// API client for communicating with the Python backend

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL|| "http://localhost:3000"
import { textToSignVideos, getSignVideoPath } from "./video-utils"

export async function translateText(text: string): Promise<string[]> {
  try {
    // First try to use local videos
    const localVideos = textToSignVideos(text)

    if (localVideos.length > 0) {
      console.log("Using local videos:", localVideos)
      return localVideos
    }

    // If no local videos found, fall back to backend API
    console.log("No local videos found, falling back to backend API")

    try {
      // Create a proxy endpoint to handle the translation
      const response = await fetch(`/api/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`Failed to translate text: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.videos || []
    } catch (error) {
      console.error("Backend API error:", error)
      // If backend API fails, return empty array
      return []
    }
  } catch (error) {
    console.error("Error translating text:", error)
    return []
  }
}

export async function classifyAction(imageBlob: Blob): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("file", imageBlob)

    const response = await fetch(`/api/classify-action`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to classify action: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.action || "Unknown"
  } catch (error) {
    console.error("Error classifying action:", error)
    return "Error"
  }
}

export async function detectSigns(imageBlob: Blob): Promise<any> {
  try {
    const formData = new FormData()
    formData.append("image", imageBlob) // Changed from "file" to "image" to match backend

    const response = await fetch(`/api/detect`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to detect signs: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error detecting signs:", error)
    throw error
  }
}

export async function validateSign(sign: string): Promise<string[]> {
  try {
    // First try to use local videos
    const videoPath = getSignVideoPath(sign)

    if (videoPath) {
      return [videoPath]
    }

    // If no local video found, fall back to backend API
    try {
      const response = await fetch(`/api/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sign }),
      })

      if (!response.ok) {
        throw new Error(`Failed to validate sign: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.videos || []
    } catch (error) {
      console.error("Backend API error:", error)
      return []
    }
  } catch (error) {
    console.error("Error validating sign:", error)
    return []
  }
}

export async function getQuizData(): Promise<{
  sign: string
  videoPath: string
  options: string[]
}> {
  try {
    // Try to generate quiz data from local videos
    try {
      const response = await fetch("/api/available-signs")

      if (!response.ok) {
        throw new Error(`Failed to get available signs: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const availableSigns = data.signs || []

      if (availableSigns.length >= 4) {
        // Randomly select 4 signs for the quiz
        const shuffled = [...availableSigns].sort(() => 0.5 - Math.random())
        const selected = shuffled.slice(0, 4)
        const correctIndex = Math.floor(Math.random() * 4)
        const correctSign = selected[correctIndex]
        const videoPath = getSignVideoPath(correctSign)

        if (videoPath) {
          return {
            sign: correctSign,
            videoPath: videoPath,
            options: selected,
          }
        }
      }
    } catch (error) {
      console.error("Error generating local quiz:", error)
    }

    // Fall back to backend API
    try {
      const response = await fetch(`/api/quiz`)

      if (!response.ok) {
        throw new Error(`Failed to get quiz data: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return {
        sign: data.sign || "",
        videoPath: data.video_path || "",
        options: data.quiz_options || [],
      }
    } catch (error) {
      console.error("Backend API error:", error)
      throw error
    }
  } catch (error) {
    console.error("Error getting quiz data:", error)
    return {
      sign: "",
      videoPath: "",
      options: [],
    }
  }
}

export function getVideoFeedUrl(): string {
  return `/api/video-feed`
}

export async function checkModelHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.model_loaded === true
  } catch (error) {
    console.error("Error checking model health:", error)
    return false
  }
}
