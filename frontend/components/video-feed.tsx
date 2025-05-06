"use client"

import { useEffect, useRef, useState } from "react"
import { getVideoFeedUrl } from "@/lib/api-client"
import { AlertCircle } from "lucide-react"

interface VideoFeedProps {
  width?: number
  height?: number
  className?: string
}

export default function VideoFeed({ width = 450, height = 300, className = "" }: VideoFeedProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const videoFeedUrl = getVideoFeedUrl()

    if (imgRef.current) {
      // Set a loading handler
      imgRef.current.onload = () => {
        setLoading(false)
      }

      // Set an error handler
      imgRef.current.onerror = () => {
        setError("Failed to load video feed")
        setLoading(false)
      }

      // Set the source
      imgRef.current.src = videoFeedUrl

      // Add a timestamp to prevent caching
      const updateFeed = () => {
        if (imgRef.current) {
          imgRef.current.src = `${videoFeedUrl}?t=${new Date().getTime()}`
        }
      }

      // Update the feed every 100ms to get a live stream effect
      const interval = setInterval(updateFeed, 100)

      return () => {
        clearInterval(interval)
        if (imgRef.current) {
          imgRef.current.src = ""
        }
      }
    }
  }, [])

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#4a628a] border-r-transparent"></div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Check if the backend server is running</p>
        </div>
      )}

      <img
        ref={imgRef}
        width={width}
        height={height}
        className={`rounded-lg border-2 border-gray-800 ${className} ${loading || error ? "opacity-0" : "opacity-100"}`}
        alt="Video Feed"
      />
    </div>
  )
}
