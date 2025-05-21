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

export default function YoloSignDetector() {
  const [captureInterval, setCaptureInterval] = useState(4)
  const [detections, setDetections] = useState<Detection[]>([])
  const [lastDetectedSign, setLastDetectedSign] = useState<string | null>(null)
  const [detectionHistory, setDetectionHistory] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(true)
  const [holisticLoaded, setHolisticLoaded] = useState(false)
  const [receiving, setReceiving] = useState(false)

  const { videoRef, canvasRef, isActive, permissionDenied, toggleCamera, startCamera } = useCamera()

  const holisticRef = useRef<any>(null)
  const lastDetectionTime = useRef<number>(0)
  const captureTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = 640
      canvas.height = 480
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    const interval = setInterval(() => {
      const now = Date.now()
      setReceiving(now - lastDetectionTime.current < 1000)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve()
      const script = document.createElement("script")
      script.src = src
      script.crossOrigin = "anonymous"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load ${src}`))
      document.head.appendChild(script)
    })

  const loadAndInitHolistic = async () => {
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js")
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js")
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js")

      const win = window as any
      const { Holistic, drawConnectors, drawLandmarks } = win
      if (!Holistic || !drawConnectors || !drawLandmarks) throw new Error("MediaPipe modules failed to load")

      const holistic = new Holistic({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      })

      holistic.setOptions({
        modelComplexity: 0, // Reduce model complexity for better performance
        smoothLandmarks: true,
        refineFaceLandmarks: false, // Disable refineFaceLandmarks for speed
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      holistic.onResults((results: any) => {
        const ctx = canvasRef.current?.getContext("2d")
        if (!ctx) return

        lastDetectionTime.current = Date.now()
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        const draw = (landmarks: any, color: string, radius = 1, width = 1) => {
          drawLandmarks(ctx, landmarks, { color, lineWidth: width, radius })
        }

        const connect = (landmarks: any, connections: any, color: string, width = 1) => {
          drawConnectors(ctx, landmarks, connections, { color, lineWidth: width })
        }

        if (results.faceLandmarks) {
          connect(results.faceLandmarks, win.FACEMESH_TESSELATION, "#8B2683", 1)
          draw(results.faceLandmarks, "#FDEFD1", 1, 1)
        }

        const hands = [
          { data: results.leftHandLandmarks, label: "Left" },
          { data: results.rightHandLandmarks, label: "Right" },
        ]

        for (const hand of hands) {
          if (hand.data) {
            connect(hand.data, win.HAND_CONNECTIONS, "#0000ED", 2)
            draw(hand.data, "#00FE00", 3, 2)
          }
        }
      })

      holisticRef.current = holistic
      setHolisticLoaded(true)
    } catch (err) {
      console.error("Holistic loading error:", err)
    }
  }

  const startCaptureInterval = () => {
    if (captureTimerRef.current) clearInterval(captureTimerRef.current)
    captureTimerRef.current = setInterval(() => {
      captureAndDetect()
    }, captureInterval * 1000)
  }

  const updateCaptureInterval = (newInterval: number) => {
    setCaptureInterval(newInterval)
    if (isActive) startCaptureInterval()
  }

  const captureAndDetect = async () => {
    if (!isActive || !videoRef.current || !canvasRef.current || isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      if (!context) throw new Error("Could not get canvas context")

      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      if (holisticLoaded && holisticRef.current && videoRef.current) {
        await holisticRef.current.send({ image: videoRef.current })
      }

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Failed to create image blob")

        const formData = new FormData()
        formData.append("image", blob, "capture.jpg")

        const response = await fetch(`${API_CONFIG.baseUrl}/detect`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) throw new Error(`Server returned ${response.status}: ${response.statusText}`)

        const data = await response.json()
        if (data.success && data.detections?.length > 0) {
          const sortedDetections = [...data.detections].sort((a, b) => b.confidence - a.confidence)
          setDetections(sortedDetections)
          const topDetection = sortedDetections[0]
          setLastDetectedSign(topDetection.class_name)

          setDetectionHistory((prev) => {
            if (prev.length === 0 || prev[prev.length - 1] !== topDetection.class_name) {
              const newHistory = [...prev, topDetection.class_name]
              return newHistory.length > 10 ? newHistory.slice(-10) : newHistory
            }
            return prev
          })
        } else {
          setDetections([])
        }
      }, "image/jpeg", 0.9)
    } catch (err: any) {
      setError(`Capture failed: ${err.message || err}`)
    } finally {
      setIsProcessing(false)
    }
  }

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

  const handleToggleCamera = async () => {
    if (isActive) {
      toggleCamera()
      return
    }
    const success = await startCamera()
    if (success) {
      await loadAndInitHolistic()
    } else {
      setError("Failed to start camera. Please check permissions and try again.")
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
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
              {isActive ? <><Pause className="w-5 h-5" /> Stop</> : <><Play className="w-5 h-5" /> Start</>}
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
          <motion.div className="mb-4 p-4 bg-gray-100 rounded-lg">
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
                  onChange={(e) => updateCaptureInterval(Number(e.target.value))}
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
                  <video ref={videoRef} className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} autoPlay playsInline muted />
                  <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" style={{ transform: "scaleX(-1)" }} />
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

            {isActive && receiving && (
              <div className="mt-2 text-sm text-green-600 text-center">✅ Holistic detection active</div>
            )}

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

                  {/* <div className="mt-4">
                    <p className="font-medium text-gray-700">Detected Sentence:</p>
                    <p className="text-xl mt-2">{detectionHistory.join(" ")}</p>
                  </div> */}

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
