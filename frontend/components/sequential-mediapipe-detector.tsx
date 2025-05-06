"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function SequentialMediaPipeDetector() {
  const [cameraActive, setCameraActive] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [handsLoaded, setHandsLoaded] = useState(false)
  const [faceMeshLoaded, setFaceMeshLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeModel, setActiveModel] = useState<"hands" | "face" | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const blackCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null)

  // References to MediaPipe objects
  const handsRef = useRef<any>(null)
  const faceMeshRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)

  // Track if results are being received
  const [receivingHandResults, setReceivingHandResults] = useState(false)
  const [receivingFaceResults, setReceivingFaceResults] = useState(false)
  const lastHandResultTime = useRef<number>(0)
  const lastFaceResultTime = useRef<number>(0)

  // Initialize canvas when component mounts
  useEffect(() => {
    const canvas = blackCanvasRef.current
    if (canvas) {
      canvas.width = 640
      canvas.height = 480
      const ctx = canvas.getContext("2d")
      canvasCtxRef.current = ctx

      // Fill with black
      if (ctx) {
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    // Set up interval to check if results are being received
    const interval = setInterval(() => {
      const now = Date.now()
      setReceivingHandResults(now - lastHandResultTime.current < 1000)
      setReceivingFaceResults(now - lastFaceResultTime.current < 1000)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Load a script dynamically
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${src}"]`)
      if (existingScript) {
        resolve()
        return
      }

      const script = document.createElement("script")
      script.src = src
      script.crossOrigin = "anonymous"
      script.onload = () => resolve()
      script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`))
      document.head.appendChild(script)
    })
  }

  // Load MediaPipe Hands
  const loadMediaPipeHands = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      // Load scripts for hands
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js")
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js")
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js")

      // Check if MediaPipe Hands objects are available
      if (
        typeof (window as any).Hands === "undefined" ||
        typeof (window as any).drawConnectors === "undefined" ||
        typeof (window as any).drawLandmarks === "undefined" ||
        typeof (window as any).Camera === "undefined"
      ) {
        throw new Error("MediaPipe Hands objects not found after loading scripts")
      }

      setHandsLoaded(true)
      setErrorMessage(null)
    } catch (error) {
      console.error("Error loading MediaPipe Hands:", error)
      setErrorMessage(`Failed to load MediaPipe Hands: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // Load MediaPipe Face Mesh
  const loadMediaPipeFaceMesh = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      // Load scripts for face mesh
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js")
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js")
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js")

      // Check if MediaPipe Face Mesh objects are available
      if (
        typeof (window as any).FaceMesh === "undefined" ||
        typeof (window as any).drawConnectors === "undefined" ||
        typeof (window as any).drawLandmarks === "undefined" ||
        typeof (window as any).Camera === "undefined"
      ) {
        throw new Error("MediaPipe Face Mesh objects not found after loading scripts")
      }

      setFaceMeshLoaded(true)
      setErrorMessage(null)
    } catch (error) {
      console.error("Error loading MediaPipe Face Mesh:", error)
      setErrorMessage(`Failed to load MediaPipe Face Mesh: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // Initialize and start MediaPipe Hands
  const startHandDetection = async () => {
    if (!handsLoaded) {
      await loadMediaPipeHands()
    }

    try {
      const Hands = (window as any).Hands
      const Camera = (window as any).Camera

      // Initialize hands
      const hands = new Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        },
      })

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      // Set up hands result handler
      hands.onResults((results: any) => {
        const ctx = canvasCtxRef.current
        if (!ctx) return

        // Clear canvas
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        lastHandResultTime.current = Date.now()

        // Draw hand landmarks
        if (results.multiHandLandmarks) {
          const drawConnectors = (window as any).drawConnectors
          const drawLandmarks = (window as any).drawLandmarks

          for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(ctx, landmarks, Hands.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 2 })
            drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 2, radius: 3 })
          }
        }
      })

      handsRef.current = hands

      // Set up camera
      if (!videoRef.current) return

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current && videoRef.current) {
            await handsRef.current.send({ image: videoRef.current })
          }
        },
        width: 640,
        height: 480,
      })

      camera.start()
      cameraRef.current = camera
      setCameraActive(true)
      setActiveModel("hands")
    } catch (error) {
      console.error("Error starting hand detection:", error)
      setErrorMessage(`Error starting hand detection: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Initialize and start MediaPipe Face Mesh
  const startFaceDetection = async () => {
    if (!faceMeshLoaded) {
      await loadMediaPipeFaceMesh()
    }

    try {
      const FaceMesh = (window as any).FaceMesh
      const Camera = (window as any).Camera

      // Initialize face mesh
      const faceMesh = new FaceMesh({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        },
      })

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      // Set up face mesh result handler
      faceMesh.onResults((results: any) => {
        const ctx = canvasCtxRef.current
        if (!ctx) return

        // Clear canvas
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        lastFaceResultTime.current = Date.now()

        // Draw face landmarks
        if (results.multiFaceLandmarks) {
          const drawConnectors = (window as any).drawConnectors
          const drawLandmarks = (window as any).drawLandmarks

          for (const landmarks of results.multiFaceLandmarks) {
            // Draw face mesh tesselation (connections between landmarks)
            drawConnectors(ctx, landmarks, FaceMesh.FACEMESH_TESSELATION, { color: "#00FFFF", lineWidth: 1 }) // Cyan color for face mesh

            // Draw face landmarks
            drawLandmarks(ctx, landmarks, { color: "#FF00FF", lineWidth: 1, radius: 1 }) // Magenta color for points
          }
        }
      })

      faceMeshRef.current = faceMesh

      // Set up camera
      if (!videoRef.current) return

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current })
          }
        },
        width: 640,
        height: 480,
      })

      camera.start()
      cameraRef.current = camera
      setCameraActive(true)
      setActiveModel("face")
    } catch (error) {
      console.error("Error starting face detection:", error)
      setErrorMessage(`Error starting face detection: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Stop camera and detection
  const stopDetection = () => {
    // Stop camera
    if (cameraRef.current) {
      cameraRef.current.stop()
      cameraRef.current = null
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    setCameraActive(false)
    setActiveModel(null)
    setReceivingHandResults(false)
    setReceivingFaceResults(false)

    // Clear canvas
    const ctx = canvasCtxRef.current
    if (ctx) {
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }
  }

  // Toggle between models
  const toggleModel = async () => {
    if (cameraActive) {
      stopDetection()
    }

    if (activeModel === "hands" || activeModel === null) {
      await startFaceDetection()
    } else {
      await startHandDetection()
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Error message */}
      {errorMessage && (
        <div className="w-full bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* MediaPipe status */}
      <div className="w-full mb-4">
        <div className={`p-3 rounded-lg ${handsLoaded || faceMeshLoaded ? "bg-green-50" : "bg-yellow-50"}`}>
          <div className="flex items-center">
            {handsLoaded || faceMeshLoaded ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
            )}
            <p className={handsLoaded || faceMeshLoaded ? "text-green-700" : "text-yellow-700"}>MediaPipe Status</p>
          </div>

          <div className="mt-1 ml-7 text-sm">
            <div className="flex items-center">
              {handsLoaded ? (
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
              )}
              <p className={handsLoaded ? "text-green-700" : "text-yellow-700"}>
                Hands: {handsLoaded ? "Loaded" : "Not loaded"}
                {cameraActive && activeModel === "hands" && (
                  <span className={`ml-2 ${receivingHandResults ? "text-green-600" : "text-orange-600"}`}>
                    ({receivingHandResults ? "Detecting" : "Not detecting"})
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center mt-1">
              {faceMeshLoaded ? (
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
              )}
              <p className={faceMeshLoaded ? "text-green-700" : "text-yellow-700"}>
                Face Mesh: {faceMeshLoaded ? "Loaded" : "Not loaded"}
                {cameraActive && activeModel === "face" && (
                  <span className={`ml-2 ${receivingFaceResults ? "text-green-600" : "text-orange-600"}`}>
                    ({receivingFaceResults ? "Detecting" : "Not detecting"})
                  </span>
                )}
              </p>
            </div>
          </div>

          {!handsLoaded && !faceMeshLoaded && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={loadMediaPipeHands}
                disabled={loading}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load Hands"
                )}
              </button>

              <button
                onClick={loadMediaPipeFaceMesh}
                disabled={loading}
                className="px-3 py-1 bg-purple-500 text-white rounded-md text-sm flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load Face Mesh"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active model indicator */}
      {activeModel && (
        <div className="w-full mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-blue-700 font-medium">
              Active Model: {activeModel === "hands" ? "Hand Detection" : "Face Detection"}
            </p>
          </div>
        </div>
      )}

      {/* Camera controls */}
      <div className="mb-4 flex gap-2">
        {!cameraActive ? (
          <>
            <button
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                handsLoaded ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400"
              } text-white`}
              onClick={startHandDetection}
              disabled={!handsLoaded}
            >
              <Camera className="w-5 h-5" />
              Start Hand Detection
            </button>

            <button
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                faceMeshLoaded ? "bg-purple-500 hover:bg-purple-600" : "bg-gray-400"
              } text-white`}
              onClick={startFaceDetection}
              disabled={!faceMeshLoaded}
            >
              <Camera className="w-5 h-5" />
              Start Face Detection
            </button>
          </>
        ) : (
          <>
            <button
              className="px-4 py-2 rounded-md flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
              onClick={stopDetection}
            >
              <Camera className="w-5 h-5" />
              Stop Detection
            </button>

            <button
              className="px-4 py-2 rounded-md flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white"
              onClick={toggleModel}
            >
              Switch to {activeModel === "hands" ? "Face" : "Hand"} Detection
            </button>
          </>
        )}
      </div>

      {/* Camera and canvas container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Original video feed */}
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

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
            {activeModel === "hands"
              ? "Hand Landmark Detection"
              : activeModel === "face"
                ? "Face Landmark Detection"
                : "Landmark Detection"}
          </div>

          {cameraActive && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Active
            </div>
          )}
        </div>
      </div>

      {/* Detection legend */}
      {cameraActive && (
        <div className="mt-4 w-full bg-gray-50 p-3 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Detection Legend</h3>
          {activeModel === "hands" && (
            <div className="flex flex-col space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Hand Landmarks</h4>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">Hand connections</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 mr-2"></div>
                <span className="text-sm text-gray-600">Hand points</span>
              </div>
            </div>
          )}

          {activeModel === "face" && (
            <div className="flex flex-col space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Face Landmarks</h4>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-cyan-400 mr-2"></div>
                <span className="text-sm text-gray-600">Face mesh</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-fuchsia-500 mr-2"></div>
                <span className="text-sm text-gray-600">Face points</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Implementation note */}
      <div className="mt-6 w-full">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800">Sequential Model Approach</h3>
          <p className="text-blue-700 mt-1">This implementation uses a sequential approach to avoid WASM conflicts:</p>
          <ul className="list-disc list-inside mt-1 text-blue-700">
            <li>Loads and runs one model at a time to prevent WASM conflicts</li>
            <li>Allows switching between hand and face detection</li>
            <li>Matches the visual output of your Python implementation</li>
            <li>Avoids the "Module.arguments" error by not running both models simultaneously</li>
          </ul>
          <p className="text-blue-700 mt-2">
            <strong>Note:</strong> Due to MediaPipe WASM limitations, we can't run both models simultaneously in the
            browser. This is a known limitation of the MediaPipe web implementation.
          </p>
        </div>
      </div>
    </div>
  )
}
