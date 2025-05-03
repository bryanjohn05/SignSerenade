"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, AlertCircle, RefreshCw, Loader2, CheckCircle } from "lucide-react"
import { loadMediaPipeEnhanced, getMediaPipeModules } from "@/lib/enhanced-mediapipe-loader"

export default function MediaPipeLandmarkDetector() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [mediapipeStatus, setMediapipeStatus] = useState<"not_loaded" | "loading" | "loaded" | "failed">("not_loaded")
  const [faceMeshStatus, setFaceMeshStatus] = useState<"not_loaded" | "loading" | "loaded" | "failed">("not_loaded")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({})

  const videoRef = useRef<HTMLVideoElement>(null)
  const blackCanvasRef = useRef<HTMLCanvasElement>(null)
  const processingCanvasRef = useRef<HTMLCanvasElement>(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  // MediaPipe objects
  const handsRef = useRef<any>(null)
  const faceMeshRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)

  // Initialize MediaPipe
  useEffect(() => {
    const initMediaPipe = async () => {
      setMediapipeStatus("loading")
      setErrorMessage(null)

      try {
        // Load MediaPipe with enhanced error handling
        const { success, error, debugInfo } = await loadMediaPipeEnhanced({ debug: true })

        if (success) {
          setMediapipeStatus("loaded")
          setDebugInfo(debugInfo || {})

          // Now load FaceMesh
          await loadFaceMesh()
        } else {
          setMediapipeStatus("failed")
          setErrorMessage(error?.message || "Failed to load MediaPipe")
          setDebugInfo(debugInfo || {})
        }
      } catch (error) {
        console.error("Error initializing MediaPipe:", error)
        setMediapipeStatus("failed")
        setErrorMessage(error instanceof Error ? error.message : String(error))
      }
    }

    initMediaPipe()
  }, [])

  // Load FaceMesh using script tag approach
  const loadFaceMesh = async () => {
    setFaceMeshStatus("loading")

    try {
      // Load FaceMesh script
      const script = document.createElement("script")
      script.src = `${window.location.origin}/mediapipe/face_mesh/face_mesh.js`

      const loadPromise = new Promise<void>((resolve, reject) => {
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Failed to load FaceMesh script"))
      })

      document.head.appendChild(script)
      await loadPromise

      // Check if FaceMesh is available
      if (typeof (window as any).FaceMesh === "undefined") {
        throw new Error("FaceMesh class not found in global scope after loading script")
      }

      // Initialize FaceMesh
      faceMeshRef.current = new (window as any).FaceMesh({
        locateFile: (file: string) => {
          return `/mediapipe/face_mesh/${file}`
        },
      })

      faceMeshRef.current.setOptions({
        maxNumFaces: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      setFaceMeshStatus("loaded")
    } catch (error) {
      console.error("Error loading FaceMesh:", error)
      setFaceMeshStatus("failed")
      setErrorMessage(`FaceMesh error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Initialize camera and tracking when MediaPipe is loaded
  useEffect(() => {
    if (mediapipeStatus !== "loaded" || !cameraActive) return

    const modules = getMediaPipeModules()
    if (!modules) return

    const { Hands, drawingUtils, cameraUtils } = modules
    const video = videoRef.current
    const blackCanvas = blackCanvasRef.current
    const processingCanvas = processingCanvasRef.current

    if (!video || !blackCanvas || !processingCanvas) return

    // Initialize canvas dimensions
    blackCanvas.width = 640
    blackCanvas.height = 480
    processingCanvas.width = 640
    processingCanvas.height = 480

    const blackCtx = blackCanvas.getContext("2d")
    const processingCtx = processingCanvas.getContext("2d")

    if (!blackCtx || !processingCtx) return

    // Clear the black canvas
    blackCtx.fillStyle = "black"
    blackCtx.fillRect(0, 0, blackCanvas.width, blackCanvas.height)

    // Initialize Hands
    if (!handsRef.current) {
      handsRef.current = new Hands({
        locateFile: (file: string) => {
          return `/mediapipe/hands/${file}`
        },
      })

      handsRef.current.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })
    }

    // Set up result handlers
    handsRef.current.onResults((results: any) => {
      if (!blackCtx || !blackCanvas) return

      // Draw hand landmarks on black canvas
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          // Draw connections
          drawingUtils.drawConnectors(blackCtx, landmarks, Hands.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 2 })

          // Draw landmarks
          drawingUtils.drawLandmarks(blackCtx, landmarks, { color: "#FF0000", lineWidth: 2, radius: 3 })
        }
      }
    })

    if (faceMeshRef.current && faceMeshStatus === "loaded") {
      faceMeshRef.current.onResults((results: any) => {
        if (!blackCtx || !blackCanvas) return

        // Draw face mesh on black canvas
        if (results.multiFaceLandmarks) {
          for (const landmarks of results.multiFaceLandmarks) {
            // Draw tesselation
            drawingUtils.drawConnectors(blackCtx, landmarks, faceMeshRef.current.FACEMESH_TESSELATION, {
              color: "#00FFFF",
              lineWidth: 1,
            })

            // Draw face contours
            drawingUtils.drawConnectors(blackCtx, landmarks, faceMeshRef.current.FACEMESH_FACE_OVAL, {
              color: "#FF00FF",
              lineWidth: 1,
            })
          }
        }
      })
    }

    // Set up camera
    if (!cameraRef.current) {
      cameraRef.current = new cameraUtils.Camera(video, {
        onFrame: async () => {
          if (video.readyState === 4) {
            // Clear the black canvas before drawing new landmarks
            blackCtx.fillStyle = "black"
            blackCtx.fillRect(0, 0, blackCanvas.width, blackCanvas.height)

            // Process with hands
            await handsRef.current.send({ image: video })

            // Process with face mesh if available
            if (faceMeshRef.current && faceMeshStatus === "loaded") {
              await faceMeshRef.current.send({ image: video })
            }

            // Flip the processing canvas horizontally (mirror effect)
            processingCtx.save()
            processingCtx.translate(processingCanvas.width, 0)
            processingCtx.scale(-1, 1)
            processingCtx.drawImage(video, 0, 0, processingCanvas.width, processingCanvas.height)
            processingCtx.restore()
          }
        },
        width: 640,
        height: 480,
      })
    }

    // Start camera
    cameraRef.current.start()

    // Clean up
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop()
      }
    }
  }, [mediapipeStatus, faceMeshStatus, cameraActive])

  // Handle starting/stopping camera
  const toggleCamera = async () => {
    if (cameraActive) {
      // Stop camera
      if (cameraRef.current) {
        cameraRef.current.stop()
        cameraRef.current = null
      }
      setCameraActive(false)

      // Clear black canvas
      const blackCanvas = blackCanvasRef.current
      if (blackCanvas) {
        const ctx = blackCanvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = "black"
          ctx.fillRect(0, 0, blackCanvas.width, blackCanvas.height)
        }
      }
    } else {
      // Start camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraActive(true)
          setPermissionDenied(false)
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        setPermissionDenied(true)
        setErrorMessage("Camera access denied. Please grant permission.")
      }
    }
  }

  // Handle retry loading MediaPipe
  const handleRetryMediaPipe = async () => {
    setMediapipeStatus("loading")
    setFaceMeshStatus("not_loaded")

    // Clean up existing instances
    if (handsRef.current) {
      handsRef.current.close()
      handsRef.current = null
    }

    if (faceMeshRef.current) {
      faceMeshRef.current.close()
      faceMeshRef.current = null
    }

    if (cameraRef.current) {
      cameraRef.current.stop()
      cameraRef.current = null
    }

    // Reload MediaPipe
    try {
      const { success, error, debugInfo } = await loadMediaPipeEnhanced({
        debug: true,
        forceReload: true,
      })

      if (success) {
        setMediapipeStatus("loaded")
        setDebugInfo(debugInfo || {})

        // Now load FaceMesh
        await loadFaceMesh()
      } else {
        setMediapipeStatus("failed")
        setErrorMessage(error?.message || "Failed to load MediaPipe")
        setDebugInfo(debugInfo || {})
      }
    } catch (error) {
      console.error("Error reloading MediaPipe:", error)
      setMediapipeStatus("failed")
      setErrorMessage(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Status messages */}
      {mediapipeStatus === "failed" && (
        <div className="w-full bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <p className="text-red-700 font-medium">MediaPipe failed to load</p>
              <p className="text-red-600 text-sm">{errorMessage || "Unknown error"}</p>
              <button
                onClick={handleRetryMediaPipe}
                className="mt-2 text-sm bg-red-200 hover:bg-red-300 text-red-800 px-3 py-1 rounded flex items-center gap-1 w-fit"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Loading MediaPipe
              </button>
            </div>
          </div>
        </div>
      )}

      {faceMeshStatus === "failed" && (
        <div className="w-full bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
            <div>
              <p className="text-yellow-700 font-medium">FaceMesh failed to load</p>
              <p className="text-yellow-600 text-sm">
                Hand tracking will still work, but face detection is unavailable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Camera controls */}
      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            mediapipeStatus === "loaded"
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={toggleCamera}
          disabled={mediapipeStatus !== "loaded"}
        >
          <Camera className="w-5 h-5" />
          {cameraActive ? "Stop Camera" : "Start Camera"}
        </button>
      </div>

      {/* Loading indicators */}
      {mediapipeStatus === "loading" && (
        <div className="flex items-center justify-center p-4 mb-4">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin mr-2" />
          <span>Loading MediaPipe...</span>
        </div>
      )}

      {mediapipeStatus === "loaded" && faceMeshStatus === "loading" && (
        <div className="flex items-center justify-center p-4 mb-4">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin mr-2" />
          <span>Loading FaceMesh...</span>
        </div>
      )}

      {/* Camera and canvas container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Original video feed (hidden in production) */}
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
          <canvas ref={processingCanvasRef} className="hidden" />

          {!cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              {permissionDenied ? (
                <div className="text-center p-4">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 text-red-500" />
                  <p>Camera access denied. Please grant permission.</p>
                </div>
              ) : (
                <p>Camera feed will appear here</p>
              )}
            </div>
          )}

          <div className="absolute top-2 left-2 text-sm bg-black/50 text-white px-2 py-1 rounded">Original Feed</div>
        </div>

        {/* Black canvas with landmarks */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <canvas ref={blackCanvasRef} className="w-full h-full" />

          {!cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <p>Landmark visualization will appear here</p>
            </div>
          )}

          <div className="absolute top-2 left-2 text-sm bg-white/50 text-black px-2 py-1 rounded">
            Landmark Detection
          </div>

          {mediapipeStatus === "loaded" && cameraActive && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              MediaPipe Active
            </div>
          )}
        </div>
      </div>

      {/* Status information */}
      <div className="mt-4 w-full">
        <h3 className="text-lg font-semibold mb-2">Status:</h3>
        <div className="bg-gray-100 p-3 rounded-lg">
          <ul className="space-y-1">
            <li className="flex justify-between">
              <span>MediaPipe Hands:</span>
              <span
                className={
                  mediapipeStatus === "loaded"
                    ? "text-green-600"
                    : mediapipeStatus === "loading"
                      ? "text-blue-600"
                      : "text-red-600"
                }
              >
                {mediapipeStatus === "loaded" ? "Loaded" : mediapipeStatus === "loading" ? "Loading..." : "Failed"}
              </span>
            </li>
            <li className="flex justify-between">
              <span>MediaPipe FaceMesh:</span>
              <span
                className={
                  faceMeshStatus === "loaded"
                    ? "text-green-600"
                    : faceMeshStatus === "loading"
                      ? "text-blue-600"
                      : faceMeshStatus === "failed"
                        ? "text-red-600"
                        : "text-gray-600"
                }
              >
                {faceMeshStatus === "loaded"
                  ? "Loaded"
                  : faceMeshStatus === "loading"
                    ? "Loading..."
                    : faceMeshStatus === "failed"
                      ? "Failed"
                      : "Not Loaded"}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Camera:</span>
              <span className={cameraActive ? "text-green-600" : "text-gray-600"}>
                {cameraActive ? "Active" : "Inactive"}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Setup instructions */}
      <div className="mt-6 w-full">
        <h3 className="text-lg font-semibold mb-2">Setup Instructions:</h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Download MediaPipe files directly:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>
                  <a
                    href="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Download hands.js
                  </a>
                </li>
                <li>
                  <a
                    href="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Download drawing_utils.js
                  </a>
                </li>
                <li>
                  <a
                    href="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Download camera_utils.js
                  </a>
                </li>
              </ul>
            </li>
            <li>
              Create directories for MediaPipe files:
              <pre className="bg-gray-800 text-white p-2 rounded mt-1 overflow-x-auto">
                mkdir -p public/mediapipe/hands public/mediapipe/drawing_utils public/mediapipe/camera_utils
              </pre>
            </li>
            <li>
              Place the downloaded files in their respective directories:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>
                  <code>hands.js</code> → <code>public/mediapipe/hands/</code>
                </li>
                <li>
                  <code>drawing_utils.js</code> → <code>public/mediapipe/drawing_utils/</code>
                </li>
                <li>
                  <code>camera_utils.js</code> → <code>public/mediapipe/camera_utils/</code>
                </li>
              </ul>
            </li>
            <li>Restart your development server after copying files.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
