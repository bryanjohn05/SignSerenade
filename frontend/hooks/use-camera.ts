"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { classifyAction } from "@/lib/api-client"

// Key for storing permission status in localStorage
const CAMERA_PERMISSION_KEY = "signserenade-camera-permission"

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [detectedAction, setDetectedAction] = useState("Waiting...")
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<"unknown" | "granted" | "denied">("unknown")
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load saved permission status on mount
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      const savedStatus = localStorage.getItem(CAMERA_PERMISSION_KEY)
      if (savedStatus === "granted" || savedStatus === "denied") {
        setPermissionStatus(savedStatus)
        if (savedStatus === "denied") {
          setPermissionDenied(true)
        }
      }
    }
  }, [])

  // Check camera permission
  const checkCameraPermission = useCallback(async (): Promise<"granted" | "denied" | "prompt"> => {
    try {
      // Check if navigator.permissions is supported
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: "camera" as PermissionName })
          return result.state as "granted" | "denied" | "prompt"
        } catch (err) {
          console.error("Error querying camera permission:", err)
        }
      }

      // Fallback: try to access the camera directly
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach((track) => track.stop())
        return "granted"
      } catch (err) {
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          return "denied"
        }
      }

      return "prompt"
    } catch (err) {
      console.error("Error checking camera permission:", err)
      return "prompt"
    }
  }, [])

  // Start the camera
  const startCamera = useCallback(
    async (skipPermissionCheck = false) => {
      try {
        console.log("Starting camera...")

        // Check permission first if not skipping
        if (!skipPermissionCheck) {
          const permissionResult = await checkCameraPermission()

          // Save permission status
          if (permissionResult === "granted" || permissionResult === "denied") {
            localStorage.setItem(CAMERA_PERMISSION_KEY, permissionResult)
            setPermissionStatus(permissionResult)
          }

          if (permissionResult === "denied") {
            setPermissionDenied(true)
            return false
          }
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        })

        setStream(mediaStream)
        setPermissionDenied(false)

        // Update permission status to granted
        localStorage.setItem(CAMERA_PERMISSION_KEY, "granted")
        setPermissionStatus("granted")

        // Check if videoRef is available, if not, retry a few times
        let retries = 0
        const maxRetries = 5

        const attachStreamToVideo = () => {
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch((err) => {
                console.error("Error playing video:", err)
              })
            }
            return true
          } else if (retries < maxRetries) {
            console.log(`Video ref not available yet, retrying... (${retries + 1}/${maxRetries})`)
            retries++
            // Try again in 100ms
            setTimeout(attachStreamToVideo, 100)
            return true
          } else {
            console.error("Video ref is not available after multiple retries")
            return false
          }
        }

        const success = attachStreamToVideo()
        setIsActive(success)
        return success
      } catch (err) {
        console.error("Error accessing camera:", err)

        // Check if permission was denied
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setPermissionDenied(true)
          localStorage.setItem(CAMERA_PERMISSION_KEY, "denied")
          setPermissionStatus("denied")
        }

        setDetectedAction("Error: Unable to access camera.")
        return false
      }
    },
    [checkCameraPermission],
  )

  // Stop the camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setIsActive(false)
    setDetectedAction("Waiting...")
  }, [stream])

  // Toggle camera state
  const toggleCamera = useCallback(async () => {
    console.log("Toggle camera, current state:", isActive)
    if (isActive) {
      stopCamera()
      return false
    } else {
      // If permission is already granted, skip the permission check
      return await startCamera(permissionStatus === "granted")
    }
  }, [isActive, startCamera, stopCamera, permissionStatus])

  // Reset permission status (useful for testing)
  const resetPermissionStatus = useCallback(() => {
    localStorage.removeItem(CAMERA_PERMISSION_KEY)
    setPermissionStatus("unknown")
    setPermissionDenied(false)
  }, [])

  // Capture frame and classify action
  const captureFrame = useCallback(async () => {
    if (!isActive || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the current frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return

      // Send to backend for classification
      const action = await classifyAction(blob)
      setDetectedAction(action)
    }, "image/jpeg")
  }, [isActive])

  // Start continuous detection
  const startDetection = useCallback(
    (interval = 3000) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      intervalRef.current = setInterval(captureFrame, interval)
    },
    [captureFrame],
  )

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return {
    videoRef,
    canvasRef,
    isActive,
    detectedAction,
    permissionDenied,
    permissionStatus,
    toggleCamera,
    startCamera,
    stopCamera,
    captureFrame,
    startDetection,
    resetPermissionStatus,
    checkCameraPermission,
  }
}
