"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Camera, Pause, Play, Settings, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { API_CONFIG } from "@/config/api-config"
import { useCamera } from "@/hooks/use-camera"

interface Detection {
  class_id: number
  class_name: string
  confidence: number
  bbox?: [number, number, number, number]
}

export default function RealTimeSignDetector() {
  const [captureInterval, setCaptureInterval] = useState(4) // seconds
  const [detections, setDetections] = useState<Detection[]>([])
  const [lastDetectedSign, setLastDetectedSign] = useState<string | null>(null)
  const [detectionHistory, setDetectionHistory] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(true)

  // Use the same camera hook that works in the YOLO component
  const { videoRef, canvasRef, isActive, permissionDenied, permissionStatus, toggleCamera, startCamera } = useCamera()

  const captureTimerRef = useRef<NodeJS.Timeout | null>(null)

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
    if (!isActive || !videoRef.current || !canvasRef.current || isProcessing) {
      console.log("Cannot capture: ", {
        isActive,
        hasVideoRef: !!videoRef.current,
        hasCanvasRef: !!canvasRef.current,
        isProcessing,
      })
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (!context) {
        setError("Could not get canvas context")
        setIsProcessing(false)
        return
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480

      // Draw the current frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      console.log(`Captured frame: ${canvas.width}x${canvas.height}`)

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
            // Send to backend for detection
            const formData = new FormData()
            formData.append("image", blob, "capture.jpg")

            const response = await fetch(`${API_CONFIG.baseUrl}/detect`, {
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              throw new Error(`Server returned ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            console.log("Detection response:", data)

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

  // Start/stop capture interval when camera state changes
  useEffect(() => {
    if (isActive) {
      startCaptureInterval()
    } else if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current)
      captureTimerRef.current = null
    }

    return () => {
      if (captureTimerRef.current) {
        clearInterval(captureTimerRef.current)
        captureTimerRef.current = null
      }
    }
  }, [isActive])

  // Handle camera toggle with additional logic
  const handleToggleCamera = async () => {
    if (isActive) {
      toggleCamera()
      return
    }

    const success = await startCamera()
    if (success) {
      console.log("Camera started successfully")
    } else {
      console.error("Failed to start camera")
      setError("Failed to start camera. Please check permissions and try again.")
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-black">Real-Time Sign Detection</h2>
          <div className="flex gap-2">
            <button
              onClick={handleToggleCamera}
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
          </div>
        </div>

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
          </motion.div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
            <button
              onClick={() => {
                setError(null)
                if (!isActive) handleToggleCamera()
              }}
              className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {isActive ? (
                <>
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                  <canvas ref={canvasRef} className="hidden" />
                  {isProcessing && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      Processing...
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  {permissionDenied ? (
                    <div className="text-center p-4">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
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
