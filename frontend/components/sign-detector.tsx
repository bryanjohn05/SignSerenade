"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Camera, AlertCircle, RefreshCw } from "lucide-react"
import { useCamera } from "@/hooks/use-camera"
import { detectSigns } from "@/lib/api-client"
import { useModal } from "@/context/modal-context"
import { API_CONFIG } from "@/config/api-config"

interface Detection {
  class_id: number
  class_name: string
  confidence: number
  bbox: [number, number, number, number]
  segmentation?: any // For image segmentation data
}

export default function SignDetector() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">("loading")
  const [retryCount, setRetryCount] = useState(0)
  const canvasOverlayRef = useRef<HTMLCanvasElement>(null)
  const segmentationCanvasRef = useRef<HTMLCanvasElement>(null)

  const {
    videoRef: cameraVideoRef,
    canvasRef,
    isActive: cameraActive,
    permissionDenied,
    permissionStatus,
    toggleCamera,
    startCamera,
  } = useCamera()

  const { showCameraPermission } = useModal()

  // Check if model is loaded
  useEffect(() => {
    const checkModel = async () => {
      try {
        const response = await fetch("/api/check-model")
        const data = await response.json()

        if (data.loaded) {
          setModelStatus("ready")
        } else {
          if (retryCount < 3) {
            // Retry a few times
            setTimeout(() => {
              setRetryCount((prev) => prev + 1)
            }, 2000)
          } else {
            setModelStatus("error")
          }
        }
      } catch (error) {
        console.error("Error checking model status:", error)
        if (retryCount < 3) {
          // Retry a few times
          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
          }, 2000)
        } else {
          setModelStatus("error")
        }
      }
    }

    checkModel()
  }, [retryCount])

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

              // Draw segmentation if available
              if (result.segmentations) {
                drawSegmentations(result.segmentations)
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

      // Draw bounding box
      ctx.strokeStyle = "#00FFFF"
      ctx.lineWidth = 2
      ctx.strokeRect(x1, y1, width, height)

      // Draw label background
      ctx.fillStyle = "#00FFFF"
      const label = `${detection.class_name} ${Math.round(detection.confidence * 100)}%`
      const textMetrics = ctx.measureText(label)
      const textHeight = 20
      ctx.fillRect(x1, y1 - textHeight, textMetrics.width + 10, textHeight)

      // Draw label text
      ctx.fillStyle = "#000000"
      ctx.font = "16px Arial"
      ctx.fillText(label, x1 + 5, y1 - 5)
    })
  }

  // Draw segmentation masks if available
  const drawSegmentations = (segmentations: any[]) => {
    const canvas = segmentationCanvasRef.current
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

    // Draw each segmentation mask
    segmentations.forEach((segmentation, index) => {
      if (segmentation.mask) {
        // Create a colored mask with transparency
        const colors = [
          "rgba(255, 0, 0, 0.3)",
          "rgba(0, 255, 0, 0.3)",
          "rgba(0, 0, 255, 0.3)",
          "rgba(255, 255, 0, 0.3)",
          "rgba(0, 255, 255, 0.3)",
          "rgba(255, 0, 255, 0.3)",
        ]

        const color = colors[index % colors.length]
        ctx.fillStyle = color

        // Draw the mask path
        if (Array.isArray(segmentation.mask)) {
          ctx.beginPath()
          for (let i = 0; i < segmentation.mask.length; i += 2) {
            const x = segmentation.mask[i]
            const y = segmentation.mask[i + 1]
            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          ctx.closePath()
          ctx.fill()
        }
      }
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
  }, [cameraActive, modelStatus, isProcessing])

  // Handle toggle camera
  const handleToggleCamera = async () => {
    if (cameraActive) {
      toggleCamera()
      return
    }

    // If permission is already granted, start camera directly
    if (permissionStatus === "granted") {
      const success = await startCamera(true) // Skip permission check
      if (success && canvasOverlayRef.current && cameraVideoRef.current) {
        canvasOverlayRef.current.width = cameraVideoRef.current.videoWidth
        canvasOverlayRef.current.height = cameraVideoRef.current.videoHeight

        if (segmentationCanvasRef.current) {
          segmentationCanvasRef.current.width = cameraVideoRef.current.videoWidth
          segmentationCanvasRef.current.height = cameraVideoRef.current.videoHeight
        }
      }
      return
    }

    showCameraPermission({
      onPermissionGranted: async () => {
        const success = await startCamera(true) // Skip permission check
        if (success && canvasOverlayRef.current && cameraVideoRef.current) {
          canvasOverlayRef.current.width = cameraVideoRef.current.videoWidth
          canvasOverlayRef.current.height = cameraVideoRef.current.videoHeight

          if (segmentationCanvasRef.current) {
            segmentationCanvasRef.current.width = cameraVideoRef.current.videoWidth
            segmentationCanvasRef.current.height = cameraVideoRef.current.videoHeight
          }
        }
      },
    })
  }

  // Handle retry loading model
  const handleRetryLoadModel = () => {
    setModelStatus("loading")
    setRetryCount(0)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <motion.button
          className="btn-primary"
          onClick={handleToggleCamera}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={modelStatus !== "ready"}
        >
          <Camera className="w-5 h-5" />
          {cameraActive ? "Stop Camera" : "Start Camera"}
        </motion.button>
      </div>

      <div className="relative w-full max-w-md aspect-video bg-black/20 rounded-lg overflow-hidden">
        {modelStatus === "loading" ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#4a628a] border-r-transparent"></div>
            <span className="ml-2 text-white">Loading {API_CONFIG.modelVersion} model...</span>
          </div>
        ) : modelStatus === "error" ? (
          <div className="absolute inset-0 flex items-center justify-center text-center p-4">
            <div>
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-red-500" />
              <p className="text-white mb-4">
                Failed to load {API_CONFIG.modelVersion} model. Please check your backend configuration.
              </p>
              <button
                onClick={handleRetryLoadModel}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
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
            <canvas ref={segmentationCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
            <canvas ref={canvasOverlayRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            {permissionDenied ? (
              <div className="text-center p-4">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 text-red-500" />
                <p>Camera access denied. Click "Start Camera" to request permission again.</p>
              </div>
            ) : (
              "Camera feed will appear here"
            )}
          </div>
        )}
      </div>

      <div className="mt-4 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2 text-black">Detected Signs:</h3>
        {detections.length > 0 ? (
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
            <ul className="space-y-1">
              {detections.map((detection, index) => (
                <li key={index} className="flex justify-between">
                  <span className="text-black">{detection.class_name}</span>
                  <span className="text-black font-mono">{(detection.confidence * 100).toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500 italic">No signs detected</p>
        )}
      </div>
    </div>
  )
}
