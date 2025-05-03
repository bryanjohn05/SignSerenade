"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Camera, Pause, Play, Settings, RefreshCw, CheckCircle, Bug, X, ArrowRight, AlertTriangle } from "lucide-react"
import { API_CONFIG } from "@/config/api-config"

interface Detection {
  class_id: number
  class_name: string
  confidence: number
  bbox?: [number, number, number, number]
}

interface BackendResponse {
  success: boolean
  detections: Detection[]
  timestamp?: number
  error?: string
  traceback?: string
}

export default function MediapipeSignDetector() {
  const [isActive, setIsActive] = useState(false)
  const [captureInterval, setCaptureInterval] = useState(4) // seconds
  const [detections, setDetections] = useState<Detection[]>([])
  const [lastDetectedSign, setLastDetectedSign] = useState<string | null>(null)
  const [detectionHistory, setDetectionHistory] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [showSettings, setShowSettings] = useState(true)
  const [showDebug, setShowDebug] = useState(false)
  const [lastResponse, setLastResponse] = useState<BackendResponse | null>(null)
  const [lastImageUrl, setLastImageUrl] = useState<string | null>(null)
  const [requestStats, setRequestStats] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
  })
  const [usingFallbackMode, setUsingFallbackMode] = useState(true)
  const [handPosition, setHandPosition] = useState({ x: 0, y: 0 })
  const [showFallbackNotice, setShowFallbackNotice] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const outputCanvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const captureTimerRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const mouseIsDownRef = useRef(false)

  // Start the camera
  const startCamera = async () => {
    try {
      // First stop any existing stream
      stopCamera()
      setError(null)

      console.log("Starting camera...")

      if (!videoRef.current) {
        throw new Error("Video element not found")
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })

      // Store the stream reference first
      streamRef.current = stream

      // Then set the video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream

        // Explicitly play the video
        try {
          await videoRef.current.play()
          console.log("Video playback started successfully")
        } catch (playError) {
          console.error("Error playing video:", playError)
          throw playError
        }
      } else {
        throw new Error("Video element lost during initialization")
      }

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error("Video element lost during initialization"))
          return
        }

        const onLoadedMetadata = () => {
          videoRef.current?.removeEventListener("loadedmetadata", onLoadedMetadata)
          console.log("Video metadata loaded")
          resolve()
        }

        videoRef.current.addEventListener("loadedmetadata", onLoadedMetadata)

        // If already loaded
        if (videoRef.current.readyState >= 2) {
          console.log("Video already loaded")
          resolve()
        }
      })

      // Set canvas dimensions
      if (outputCanvasRef.current && videoRef.current) {
        outputCanvasRef.current.width = videoRef.current.videoWidth || 640
        outputCanvasRef.current.height = videoRef.current.videoHeight || 480
        console.log(`Canvas dimensions set: ${outputCanvasRef.current.width}x${outputCanvasRef.current.height}`)
      }

      if (canvasRef.current && videoRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth || 640
        canvasRef.current.height = videoRef.current.videoHeight || 480
      }

      // Start frame processing
      startFrameProcessing()

      setIsActive(true)
      setPermissionDenied(false)
      startCaptureInterval()
      console.log("Camera started successfully")
    } catch (err) {
      console.error("Error accessing camera:", err)

      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setPermissionDenied(true)
        setError("Camera access denied. Please check your browser permissions.")
      } else {
        setError(`Camera error: ${err instanceof Error ? err.message : String(err)}`)
      }

      setIsActive(false)

      // Clean up any partial initialization
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }

  // Process video frames and draw landmarks
  const startFrameProcessing = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    const processFrame = () => {
      // Check if we should continue processing
      if (!isActive || !videoRef.current || !outputCanvasRef.current) {
        console.log("Camera inactive or refs not available, stopping frame processing")
        return
      }

      const video = videoRef.current
      const canvas = outputCanvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        console.error("Could not get canvas context")
        return
      }

      // Clear canvas with black background
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw video frame with reduced opacity
      if (video.readyState >= 2) {
        ctx.globalAlpha = 0.3 // Make video semi-transparent
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ctx.globalAlpha = 1.0 // Reset alpha for other drawings
      }

      // Draw simulated landmarks
      drawSimulatedFaceLandmarks(ctx, canvas.width, canvas.height)
      drawSimulatedHandLandmarks(ctx, canvas.width, canvas.height, "left", handPosition)
      drawSimulatedHandLandmarks(ctx, canvas.width, canvas.height, "right", {
        x: canvas.width - handPosition.x,
        y: handPosition.y,
      })

      // Continue processing frames only if still active
      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(processFrame)
      } else {
        console.log("Camera inactive, stopping frame processing")
      }
    }

    // Start the animation frame loop
    console.log("Starting frame processing")
    animationFrameRef.current = requestAnimationFrame(processFrame)
  }

  // Draw simulated face landmarks
  const drawSimulatedFaceLandmarks = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 3
    const faceWidth = width / 4
    const faceHeight = height / 3

    // Draw face mesh points
    ctx.fillStyle = "#FF00FF"
    ctx.strokeStyle = "#FF00FF"
    ctx.lineWidth = 1

    // Draw face oval
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, faceWidth / 2, faceHeight / 2, 0, 0, 2 * Math.PI)
    ctx.stroke()

    // Draw eyes
    const eyeWidth = faceWidth / 5
    const eyeHeight = faceHeight / 8
    const eyeY = centerY - faceHeight / 8

    // Left eye
    ctx.beginPath()
    ctx.ellipse(centerX - faceWidth / 4, eyeY, eyeWidth, eyeHeight, 0, 0, 2 * Math.PI)
    ctx.stroke()

    // Right eye
    ctx.beginPath()
    ctx.ellipse(centerX + faceWidth / 4, eyeY, eyeWidth, eyeHeight, 0, 0, 2 * Math.PI)
    ctx.stroke()

    // Draw nose
    ctx.beginPath()
    ctx.moveTo(centerX, eyeY + eyeHeight * 2)
    ctx.lineTo(centerX - faceWidth / 10, centerY + faceHeight / 8)
    ctx.lineTo(centerX + faceWidth / 10, centerY + faceHeight / 8)
    ctx.closePath()
    ctx.stroke()

    // Draw mouth
    ctx.beginPath()
    ctx.ellipse(centerX, centerY + faceHeight / 4, faceWidth / 3, faceHeight / 10, 0, 0, Math.PI)
    ctx.stroke()

    // Draw face mesh grid
    const gridSize = 10
    const stepX = faceWidth / gridSize
    const stepY = faceHeight / gridSize

    for (let i = 0; i <= gridSize; i++) {
      // Horizontal lines
      ctx.beginPath()
      ctx.moveTo(centerX - faceWidth / 2, centerY - faceHeight / 2 + i * stepY)
      ctx.lineTo(centerX + faceWidth / 2, centerY - faceHeight / 2 + i * stepY)
      ctx.stroke()

      // Vertical lines
      ctx.beginPath()
      ctx.moveTo(centerX - faceWidth / 2 + i * stepX, centerY - faceHeight / 2)
      ctx.lineTo(centerX - faceWidth / 2 + i * stepX, centerY + faceHeight / 2)
      ctx.stroke()
    }
  }

  // Draw simulated hand landmarks
  const drawSimulatedHandLandmarks = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    side: "left" | "right",
    position = { x: 0, y: 0 },
  ) => {
    // Use the provided position or default to a position based on the side
    const handX = position.x || (side === "left" ? width / 4 : (width * 3) / 4)
    const handY = position.y || (height * 2) / 3
    const handSize = width / 6

    // Define finger points
    const wrist = { x: handX, y: handY }
    const fingers = []

    // Create 5 fingers
    for (let i = 0; i < 5; i++) {
      const angle = (side === "left" ? -Math.PI / 4 : (-Math.PI * 3) / 4) + (i * Math.PI) / 8
      const length = handSize * (0.6 + (i === 2 ? 0.3 : i === 0 ? -0.2 : 0))

      // Each finger has 4 points (including knuckle)
      const finger = []

      // Knuckle
      finger.push({
        x: wrist.x + Math.cos(angle) * handSize * 0.3,
        y: wrist.y + Math.sin(angle) * handSize * 0.3,
      })

      // 3 segments
      for (let j = 1; j <= 3; j++) {
        finger.push({
          x: wrist.x + Math.cos(angle) * length * (j / 3),
          y: wrist.y + Math.sin(angle) * length * (j / 3),
        })
      }

      fingers.push(finger)
    }

    // Draw connections (blue lines)
    ctx.strokeStyle = "#0000FF"
    ctx.lineWidth = 2

    // Draw palm connections
    ctx.beginPath()
    ctx.moveTo(wrist.x, wrist.y)
    ctx.lineTo(fingers[0][0].x, fingers[0][0].y)
    ctx.stroke()

    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(fingers[i][0].x, fingers[i][0].y)
      ctx.lineTo(fingers[i + 1][0].x, fingers[i + 1][0].y)
      ctx.stroke()
    }

    // Draw finger connections
    for (const finger of fingers) {
      for (let i = 0; i < finger.length - 1; i++) {
        ctx.beginPath()
        ctx.moveTo(finger[i].x, finger[i].y)
        ctx.lineTo(finger[i + 1].x, finger[i + 1].y)
        ctx.stroke()
      }
    }

    // Draw points (green dots)
    ctx.fillStyle = "#00FF00"

    // Draw wrist point
    ctx.beginPath()
    ctx.arc(wrist.x, wrist.y, 4, 0, 2 * Math.PI)
    ctx.fill()

    // Draw finger points
    for (const finger of fingers) {
      for (const point of finger) {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
  }

  // Stop the camera
  const stopCamera = () => {
    console.log("Stopping camera...")

    // First stop the animation frame
    if (animationFrameRef.current) {
      console.log("Canceling animation frame")
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Then stop the capture interval
    if (captureTimerRef.current) {
      console.log("Clearing capture interval")
      clearInterval(captureTimerRef.current)
      captureTimerRef.current = null
    }

    // Finally stop the media tracks
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks()
      console.log(`Stopping ${tracks.length} media tracks`)
      tracks.forEach((track) => {
        console.log(`Stopping track: ${track.kind}`)
        track.stop()
      })
      streamRef.current = null
    }

    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null
      console.log("Cleared video source")
    }

    setIsActive(false)
    console.log("Camera stopped")
  }

  // Toggle camera
  const toggleCamera = () => {
    console.log(`Toggling camera. Current state: ${isActive}`)
    if (isActive) {
      stopCamera()
    } else {
      startCamera()
    }
  }

  // Start capturing frames at regular intervals
  const startCaptureInterval = () => {
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current)
    }

    console.log(`Setting capture interval to ${captureInterval} seconds`)
    captureTimerRef.current = setInterval(() => {
      captureAndDetect()
    }, captureInterval * 1000)
  }

  // Update capture interval
  const updateCaptureInterval = (newInterval: number) => {
    setCaptureInterval(newInterval)
    if (isActive) {
      startCaptureInterval()
    }
  }

  // Capture frame and send for detection
  const captureAndDetect = async () => {
    if (!isActive || !outputCanvasRef.current || isProcessing) {
      console.log("Cannot capture: ", {
        isActive,
        hasOutputCanvasRef: !!outputCanvasRef.current,
        isProcessing,
      })
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // We'll use the output canvas that already has the visualization
      const canvas = outputCanvasRef.current

      // Save the image URL for debugging
      setLastImageUrl(canvas.toDataURL("image/jpeg", 0.9))

      // Convert canvas to blob
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setError("Failed to create image blob")
            setIsProcessing(false)
            return
          }

          try {
            console.log(`Sending blob to backend (size: ${blob.size} bytes)`)

            // Update request stats
            setRequestStats((prev) => ({
              ...prev,
              totalRequests: prev.totalRequests + 1,
            }))

            // Record start time for response time calculation
            const startTime = performance.now()

            // Send to backend for detection
            const formData = new FormData()
            formData.append("image", blob, "capture.jpg")

            const response = await fetch(`${API_CONFIG.baseUrl}/detect`, {
              method: "POST",
              body: formData,
            })

            // Calculate response time
            const responseTime = performance.now() - startTime

            if (!response.ok) {
              throw new Error(`Server returned ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            console.log("Detection response:", data)

            // Save the full response for debugging
            setLastResponse(data)

            // Update request stats
            setRequestStats((prev) => {
              const newSuccessful = prev.successfulRequests + 1
              const newAverage = (prev.averageResponseTime * prev.successfulRequests + responseTime) / newSuccessful

              return {
                ...prev,
                successfulRequests: newSuccessful,
                averageResponseTime: newAverage,
              }
            })

            if (data.success && data.detections && data.detections.length > 0) {
              // Sort by confidence (highest first)
              const sortedDetections = [...data.detections].sort((a, b) => b.confidence - a.confidence)
              setDetections(sortedDetections)

              // Get the highest confidence detection
              const topDetection = sortedDetections[0]
              setLastDetectedSign(topDetection.class_name)

              // Add to history if it's different from the last one
              setDetectionHistory((prev) => {
                // Only add if it's different from the last one
                if (prev.length === 0 || prev[prev.length - 1] !== topDetection.class_name) {
                  // Keep only the last 10 detections
                  const newHistory = [...prev, topDetection.class_name]
                  if (newHistory.length > 10) {
                    return newHistory.slice(-10)
                  }
                  return newHistory
                }
                return prev
              })
            } else {
              // No detections
              setDetections([])
            }
          } catch (error) {
            console.error("Error detecting signs:", error)
            setError(`Detection failed: ${error instanceof Error ? error.message : String(error)}`)

            // Update request stats
            setRequestStats((prev) => ({
              ...prev,
              failedRequests: prev.failedRequests + 1,
            }))

            // Save error response for debugging
            setLastResponse({
              success: false,
              detections: [],
              error: error instanceof Error ? error.message : String(error),
            })
          } finally {
            setIsProcessing(false)
          }
        },
        "image/jpeg",
        0.9,
      )
    } catch (error) {
      console.error("Error capturing frame:", error)
      setError(`Capture failed: ${error instanceof Error ? error.message : String(error)}`)
      setIsProcessing(false)
    }
  }

  // Handle visibility change
  const handleVisibilityChange = () => {
    if (document.hidden && isActive) {
      console.log("Page hidden, pausing camera processing but keeping stream active")
      // Instead of stopping completely, just pause the capture interval and animation
      if (captureTimerRef.current) {
        clearInterval(captureTimerRef.current)
        captureTimerRef.current = null
      }

      // Pause animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    } else if (!document.hidden && isActive && streamRef.current) {
      console.log("Page visible again, resuming camera processing")
      // Resume capture interval and frame processing
      startCaptureInterval()
      startFrameProcessing()
    }
  }

  // Handle mouse/touch events for interactive hand movement
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    mouseIsDownRef.current = true
    updateHandPosition(e)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mouseIsDownRef.current) {
      updateHandPosition(e)
    }
  }

  const handleMouseUp = () => {
    mouseIsDownRef.current = false
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    mouseIsDownRef.current = true
    updateHandPositionFromTouch(e)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (mouseIsDownRef.current) {
      updateHandPositionFromTouch(e)
    }
  }

  const handleTouchEnd = () => {
    mouseIsDownRef.current = false
  }

  const updateHandPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!outputCanvasRef.current) return

    const rect = outputCanvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const scaleX = outputCanvasRef.current.width / rect.width
    const scaleY = outputCanvasRef.current.height / rect.height

    setHandPosition({
      x: x * scaleX,
      y: y * scaleY,
    })
  }

  const updateHandPositionFromTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!outputCanvasRef.current || !e.touches[0]) return

    const rect = outputCanvasRef.current.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const y = e.touches[0].clientY - rect.top
    const scaleX = outputCanvasRef.current.width / rect.width
    const scaleY = outputCanvasRef.current.height / rect.height

    setHandPosition({
      x: x * scaleX,
      y: y * scaleY,
    })
  }

  // Clean up on unmount or when changing tabs
  useEffect(() => {
    // Handle visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Clean up on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      stopCamera()
    }
  }, [isActive, captureInterval])

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-black">Sign Language Detection</h2>
          <div className="flex gap-2">
            <button
              onClick={toggleCamera}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isActive ? "bg-red-500 hover:bg-red-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5" /> Stop
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" /> Start
                </>
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className={`${
                showDebug ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-800"
              } hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2`}
            >
              <Bug className="w-5 h-5" />
              Debug
            </button>
          </div>
        </div>

        {usingFallbackMode && showFallbackNotice && (
          <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-medium">Running in fallback mode</p>
                <p className="text-sm">MediaPipe libraries could not be loaded. Using simplified hand tracking.</p>
              </div>
            </div>
            <button onClick={() => setShowFallbackNotice(false)} className="text-amber-700 hover:text-amber-900">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {showSettings && (
          <motion.div
            className="mb-4 p-4 bg-gray-100 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="font-medium mb-2">Detection Settings</h3>
            <div className="flex items-center gap-4">
              <div>
                <label htmlFor="captureInterval" className="block text-sm font-medium text-gray-700 mb-1">
                  Capture Interval (seconds)
                </label>
                <input
                  type="range"
                  id="captureInterval"
                  min="1"
                  max="10"
                  step="1"
                  value={captureInterval}
                  onChange={(e) => updateCaptureInterval(Number.parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm">{captureInterval}s</div>
              </div>
              <button
                onClick={captureAndDetect}
                disabled={!isActive || isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                Capture Now
              </button>
            </div>

            {usingFallbackMode && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Fallback Mode Controls</h4>
                <p className="text-sm text-gray-600 mb-2">Click and drag on the video to move the hand landmarks.</p>
              </div>
            )}
          </motion.div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
            <button
              onClick={() => {
                setError(null)
                if (!isActive) startCamera()
              }}
              className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        )}

        {/* Debug Panel */}
        {showDebug && (
          <div className="mb-4 p-4 bg-gray-800 text-white rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium flex items-center gap-2">
                <Bug className="w-5 h-5" /> Backend Communication Debug
              </h3>
              <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-700 p-3 rounded">
                <h4 className="text-sm font-medium mb-2">Request Statistics</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Requests:</span>
                    <span className="font-mono">{requestStats.totalRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Successful:</span>
                    <span className="font-mono text-green-400">{requestStats.successfulRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed:</span>
                    <span className="font-mono text-red-400">{requestStats.failedRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response Time:</span>
                    <span className="font-mono">{requestStats.averageResponseTime.toFixed(2)}ms</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-3 rounded">
                <h4 className="text-sm font-medium mb-2">System Status</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Mode:</span>
                    <span className="font-mono text-yellow-400">Fallback</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Camera:</span>
                    <span className="font-mono text-green-400">{isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing:</span>
                    <span className="font-mono text-green-400">{isProcessing ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Last Captured Image</h4>
                {lastImageUrl ? (
                  <div className="relative bg-black rounded overflow-hidden aspect-video">
                    <img
                      src={lastImageUrl || "/placeholder.svg"}
                      alt="Last captured frame"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                      Sent to backend
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-700 rounded aspect-video flex items-center justify-center text-gray-400 text-sm">
                    No image captured yet
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Backend Response</h4>
                <div className="bg-gray-700 rounded p-2 h-48 overflow-y-auto font-mono text-xs">
                  {lastResponse ? (
                    <pre className="whitespace-pre-wrap break-words">{JSON.stringify(lastResponse, null, 2)}</pre>
                  ) : (
                    <div className="text-gray-400 flex items-center justify-center h-full">No response yet</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-700">
              <h4 className="text-sm font-medium mb-2">Backend Connection</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">Endpoint:</span>
                <code className="bg-gray-700 px-2 py-1 rounded text-xs font-mono flex-1">
                  {API_CONFIG.baseUrl}/detect
                </code>
                <button
                  onClick={captureAndDetect}
                  disabled={!isActive || isProcessing}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Test Now
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {/* Video element for capturing camera feed */}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover opacity-0 z-10"
                autoPlay
                playsInline
                muted
              />

              {/* Hidden canvas for processing */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Visible canvas for displaying output */}
              <canvas
                ref={outputCanvasRef}
                className="w-full h-full object-cover bg-black"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />

              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  {permissionDenied ? (
                    <div className="text-center p-4">
                      <Camera className="w-12 h-12 mx-auto mb-2 text-red-500" />
                      <p>Camera access denied</p>
                      <p className="text-sm opacity-70">Please check your browser permissions</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-400">Click Start to begin</p>
                    </div>
                  )}
                </div>
              )}

              {isProcessing && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  Processing...
                </div>
              )}

              {/* Backend status indicator */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                <div
                  className={`w-2 h-2 rounded-full ${
                    requestStats.totalRequests === 0
                      ? "bg-gray-400"
                      : requestStats.failedRequests === 0
                        ? "bg-green-500"
                        : requestStats.failedRequests < requestStats.successfulRequests
                          ? "bg-yellow-500"
                          : "bg-red-500"
                  }`}
                />
                <span>
                  {requestStats.totalRequests === 0
                    ? "Backend: Not tested"
                    : requestStats.failedRequests === 0
                      ? "Backend: Connected"
                      : requestStats.failedRequests < requestStats.successfulRequests
                        ? "Backend: Partial connection"
                        : "Backend: Connection issues"}
                </span>
              </div>

              {/* Fallback mode indicator */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>Fallback Mode</span>
              </div>
            </div>

            {lastDetectedSign && (
              <motion.div
                className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">Last Detected Sign</p>
                  <h3 className="text-3xl font-bold text-blue-800">{lastDetectedSign}</h3>
                </div>
              </motion.div>
            )}
          </div>

          <div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Detection History
              </h3>

              {detectionHistory.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {detectionHistory.map((sign, index) => (
                      <motion.div
                        key={`${sign}-${index}`}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {sign}
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <p className="font-medium text-gray-700">Detected Sentence:</p>
                    <p className="text-xl mt-2">{detectionHistory.join(" ")}</p>
                  </div>

                  <button
                    onClick={() => setDetectionHistory([])}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Clear History
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No signs detected yet</p>
                  <p className="text-sm mt-2">Signs will appear here as they are detected</p>
                </div>
              )}

              {detections.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Current Detections:</h4>
                  <div className="bg-white p-3 rounded border border-gray-200 max-h-40 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1">Sign</th>
                          <th className="text-right py-1">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detections.map((detection, index) => (
                          <tr key={index} className={index === 0 ? "bg-blue-50" : ""}>
                            <td className="py-1">{detection.class_name}</td>
                            <td className="text-right py-1">{(detection.confidence * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
