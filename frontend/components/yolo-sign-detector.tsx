"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, AlertCircle, Loader2, CheckCircle2, Sparkles, RefreshCw, Server } from "lucide-react"
import { useCamera } from "@/hooks/use-camera"
import { detectSigns } from "@/lib/api-client"
import { API_CONFIG } from "@/config/api-config"

interface Detection {
  class_id: number
  class_name: string
  confidence: number
  bbox: [number, number, number, number]
}

export default function YoloSignDetector() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">("loading")
  const [modelError, setModelError] = useState<string | null>(null)
  const [detectedText, setDetectedText] = useState<string[]>([])
  const [showConfidence, setShowConfidence] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isCheckingModel, setIsCheckingModel] = useState(false)
  const canvasOverlayRef = useRef<HTMLCanvasElement>(null)

  const {
    videoRef: cameraVideoRef,
    canvasRef,
    isActive: cameraActive,
    permissionDenied,
    permissionStatus,
    toggleCamera,
    startCamera,
  } = useCamera()

  // Check if model is loaded
  useEffect(() => {
    const checkModel = async () => {
      if (isCheckingModel) return

      setIsCheckingModel(true)
      setModelError(null)

      try {
        console.log("Checking model status, attempt:", retryCount + 1)
        const response = await fetch("/api/check-model")

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Model check response:", data)

        if (data.loaded) {
          setModelStatus("ready")
          setModelError(null)
        } else {
          if (retryCount < 3) {
            // Retry a few times
            setTimeout(() => {
              setRetryCount((prev) => prev + 1)
            }, 2000)
            setModelError(data.error || "Model not loaded. Retrying...")
          } else {
            setModelStatus("error")
            setModelError(data.error || "Failed to load model after multiple attempts")
          }
        }
      } catch (error) {
        console.error("Error checking model status:", error)

        if (retryCount < 3) {
          // Retry a few times
          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
          }, 2000)
          setModelError(`Connection error: ${error instanceof Error ? error.message : String(error)}`)
        } else {
          setModelStatus("error")
          setModelError(`Failed to connect to backend: ${error instanceof Error ? error.message : String(error)}`)
        }
      } finally {
        setIsCheckingModel(false)
      }
    }

    checkModel()
  }, [retryCount, isCheckingModel])

  // Process frame and detect signs
  const processFrame = async () => {
    if (!cameraActive || !canvasRef.current || isProcessing) return

    setIsProcessing(true)

    try {
      const canvas = canvasRef.current
      const video = cameraVideoRef.current

      if (!video) return

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the current frame to the canvas
      const context = canvas.getContext("2d")
      if (!context) return

      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to blob
      canvas.toBlob(
        async (blob) => {
          if (!blob) return

          try {
            // Send to backend for detection
            const result = await detectSigns(blob)

            if (result.success) {
              setDetections(result.detections)
              drawDetections(result.detections)

              // Update detected text
              const newDetectedText = result.detections
                .filter((d: Detection) => d.confidence > 0.6) // Only include high confidence detections
                .map((d: Detection) => d.class_name)

              if (newDetectedText.length > 0) {
                setDetectedText((prev) => {
                  // Add new detections to the array, but avoid duplicates
                  const combined = [...prev]
                  newDetectedText.forEach((text: string) => {
                    if (!combined.includes(text)) {
                      combined.push(text)
                    }
                  })
                  // Keep only the last 5 unique detections
                  return combined.slice(-5)
                })
              }
            }
          } catch (error) {
            console.error("Error detecting signs:", error)
          } finally {
            setIsProcessing(false)
          }
        },
        "image/jpeg",
        0.9,
      )
    } catch (error) {
      console.error("Error processing frame:", error)
      setIsProcessing(false)
    }
  }

  // Draw bounding boxes and labels on the overlay canvas
  const drawDetections = (detections: Detection[]) => {
    const canvas = canvasOverlayRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas dimensions to match video
    if (cameraVideoRef.current) {
      canvas.width = cameraVideoRef.current.videoWidth
      canvas.height = cameraVideoRef.current.videoHeight
    }

    // Draw each detection
    detections.forEach((detection) => {
      const [x1, y1, x2, y2] = detection.bbox
      const width = x2 - x1
      const height = y2 - y1

      // Calculate confidence color (green for high confidence, yellow for medium, red for low)
      const confidenceColor =
        detection.confidence > 0.7
          ? "rgba(0, 255, 128, 0.8)"
          : detection.confidence > 0.5
            ? "rgba(255, 255, 0, 0.8)"
            : "rgba(255, 0, 0, 0.8)"

      // Draw bounding box with glow effect
      ctx.shadowColor = confidenceColor
      ctx.shadowBlur = 10
      ctx.strokeStyle = confidenceColor
      ctx.lineWidth = 3
      ctx.strokeRect(x1, y1, width, height)

      // Reset shadow for text
      ctx.shadowBlur = 0

      // Draw label background
      ctx.fillStyle = confidenceColor
      const label = showConfidence
        ? `${detection.class_name} ${Math.round(detection.confidence * 100)}%`
        : detection.class_name
      const textMetrics = ctx.measureText(label)
      const textHeight = 24
      ctx.fillRect(x1, y1 - textHeight, textMetrics.width + 10, textHeight)

      // Draw label text
      ctx.fillStyle = "#000000"
      ctx.font = "bold 16px Inter, sans-serif"
      ctx.fillText(label, x1 + 5, y1 - 5)
    })
  }

  // Start detection loop when camera is active
  useEffect(() => {
    let animationFrameId: number

    const detectLoop = () => {
      processFrame()
      animationFrameId = requestAnimationFrame(detectLoop)
    }

    if (cameraActive && modelStatus === "ready") {
      detectLoop()
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [cameraActive, modelStatus, isProcessing, showConfidence])

  // Handle toggle camera
  const handleToggleCamera = async () => {
    if (cameraActive) {
      toggleCamera()
      // Clear detections when stopping camera
      setDetectedText([])
      return
    }

    // If permission is already granted, start camera directly
    if (permissionStatus === "granted") {
      const success = await startCamera(true) // Skip permission check
      if (success && canvasOverlayRef.current && cameraVideoRef.current) {
        canvasOverlayRef.current.width = cameraVideoRef.current.videoWidth
        canvasOverlayRef.current.height = cameraVideoRef.current.videoHeight
      }
      return
    }

    // Otherwise request permission
    const permissionResult = await navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => true)
      .catch(() => false)

    if (permissionResult) {
      const success = await startCamera(true)
      if (success && canvasOverlayRef.current && cameraVideoRef.current) {
        canvasOverlayRef.current.width = cameraVideoRef.current.videoWidth
        canvasOverlayRef.current.height = cameraVideoRef.current.videoHeight
      }
    }
  }

  // Clear detected text
  const clearDetectedText = () => {
    setDetectedText([])
  }

  // Handle retry loading model
  const handleRetryLoadModel = () => {
    setModelStatus("loading")
    setRetryCount(0)
    setModelError(null)
  }

  // Show backend URL for debugging
  const showBackendInfo = () => {
    return (
      <div className="text-xs text-gray-400 mt-2 flex items-center justify-center">
        <Server className="w-3 h-3 mr-1" />
        Backend URL: {API_CONFIG.baseUrl}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-between w-full mb-4">
        <motion.button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            cameraActive
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          }`}
          onClick={handleToggleCamera}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={modelStatus !== "ready"}
        >
          <Camera className="w-5 h-5" />
          {cameraActive ? "Stop Camera" : "Start Camera"}
        </motion.button>

        <div className="flex gap-2">
          <motion.button
            className="flex items-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all"
            onClick={() => setShowConfidence(!showConfidence)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            title="Toggle confidence scores"
          >
            <Sparkles className="w-4 h-4" />
            {showConfidence ? "Hide Scores" : "Show Scores"}
          </motion.button>

          <motion.button
            className="flex items-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all"
            onClick={clearDetectedText}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={detectedText.length === 0}
          >
            Clear
          </motion.button>
        </div>
      </div>

      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-xl">
        {modelStatus === "loading" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
              <p className="text-white font-medium">Loading YOLO model...</p>
              {modelError && <p className="text-yellow-400 text-sm mt-2 max-w-md text-center">{modelError}</p>}
              {showBackendInfo()}
            </div>
          </div>
        ) : modelStatus === "error" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="flex flex-col items-center text-center p-4">
              <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
              <p className="text-white font-medium">Failed to load YOLO model</p>
              {modelError && <p className="text-yellow-400 text-sm mt-2 max-w-md">{modelError}</p>}
              <p className="text-gray-400 text-sm mt-2">Please check your backend configuration</p>
              {showBackendInfo()}
              <button
                onClick={handleRetryLoadModel}
                className="mt-4 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        ) : cameraActive ? (
          <>
            <video ref={cameraVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <canvas ref={canvasOverlayRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
            {isProcessing && (
              <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            {permissionDenied ? (
              <div className="text-center p-6 max-w-md">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
                <h3 className="text-white text-xl font-bold mb-2">Camera Access Denied</h3>
                <p className="text-gray-300">
                  Please enable camera access in your browser settings to use sign language detection.
                </p>
              </div>
            ) : (
              <div className="text-center p-6">
                <Camera className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400 text-lg">Click "Start Camera" to begin sign detection</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 w-full">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xl font-bold text-black">Detected Signs</h3>
          {detectedText.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {detectedText.length}
            </span>
          )}
        </div>

        <AnimatePresence>
          {detectedText.length > 0 ? (
            <motion.div
              className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-wrap gap-2">
                {detectedText.map((text, index) => (
                  <motion.div
                    key={`${text}-${index}`}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {text}
                  </motion.div>
                ))}
              </div>

              <p className="mt-3 text-black text-lg font-medium">{detectedText.join(" ")}</p>
            </motion.div>
          ) : (
            <motion.div
              className="bg-gray-100 p-6 rounded-xl text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-500 italic">No signs detected yet</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
