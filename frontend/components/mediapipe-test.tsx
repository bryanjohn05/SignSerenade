"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Camera, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function MediaPipeTest() {
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mediapipeStatus, setMediapipeStatus] = useState<"loading" | "success" | "error" | "idle">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Load MediaPipe and test it
  const testMediaPipe = async () => {
    setIsLoading(true)
    setMediapipeStatus("loading")
    setErrorMessage(null)

    try {
      // Try to import MediaPipe modules
      const [handsModule, drawingUtilsModule, cameraUtilsModule] = await Promise.all([
        import("@mediapipe/hands"),
        import("@mediapipe/drawing_utils"),
        import("@mediapipe/camera_utils"),
      ])

      const { Hands } = handsModule
      const { drawConnectors, drawLandmarks } = drawingUtilsModule
      const { Camera: MPCamera } = cameraUtilsModule

      if (!Hands || !drawConnectors || !drawLandmarks || !MPCamera) {
        throw new Error("Failed to load MediaPipe modules")
      }

      // Initialize MediaPipe Hands
      const hands = new Hands({
        locateFile: (file) => {
          return `/mediapipe/hands/${file}`
        },
      })

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      // Set up the canvas for drawing
      const canvas = canvasRef.current
      const video = videoRef.current

      if (!canvas || !video) {
        throw new Error("Canvas or video element not found")
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Failed to get canvas context")
      }

      // Set up camera
      const camera = new MPCamera(video, {
        onFrame: async () => {
          if (video.readyState === 4) {
            await hands.send({ image: video })
          }
        },
        width: 640,
        height: 480,
      })

      // Set up result handler
      hands.onResults((results) => {
        if (!ctx || !canvas) return

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Draw hand landmarks
        if (results.multiHandLandmarks) {
          for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(ctx, landmarks, handsModule.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 5 })
            drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 2 })
          }
        }
      })

      // Start camera
      await camera.start()
      setMediapipeStatus("success")
      setIsActive(true)
    } catch (error) {
      console.error("MediaPipe test failed:", error)
      setMediapipeStatus("error")
      setErrorMessage(error instanceof Error ? error.message : String(error))
      setIsActive(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Stop camera and MediaPipe
  const stopTest = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsActive(false)
    setMediapipeStatus("idle")
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-black">MediaPipe Test</h2>

      <div className="mb-4">
        <p className="text-gray-700 mb-2">
          This test will check if MediaPipe hand tracking is working correctly on your device.
        </p>

        {mediapipeStatus === "error" && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <p className="text-red-700 font-medium">MediaPipe Error</p>
                <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {mediapipeStatus === "success" && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <div className="flex">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <div>
                <p className="text-green-700 font-medium">MediaPipe is working!</p>
                <p className="text-green-600 text-sm mt-1">
                  Hand tracking is active. Try moving your hand in front of the camera.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
        {isActive ? (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" width={640} height={480} />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      <div className="flex justify-center">
        {isActive ? (
          <motion.button
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            onClick={stopTest}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Camera className="w-5 h-5" />
            Stop Test
          </motion.button>
        ) : (
          <motion.button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            onClick={testMediaPipe}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading MediaPipe...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Start MediaPipe Test
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  )
}
