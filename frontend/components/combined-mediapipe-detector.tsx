"use client"

import { useState, useRef, useEffect } from "react"

export default function CDNMediaPipeHolisticDetector() {
  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [receiving, setReceiving] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

  const holisticRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const lastDetectionTime = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = 640
      canvas.height = 480
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctxRef.current = ctx
      }
    }

    const id = setInterval(() => {
      const now = Date.now()
      setReceiving(now - lastDetectionTime.current < 1000)
    }, 500)

    return () => clearInterval(id)
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

  const loadMediaPipe = async () => {
    setLoading(true)
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js")
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js")
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js") // Required for window.Camera
    } catch (err) {
      setErrorMessage((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const initHolistic = () => {
    const win = window as any
    if (!win.Holistic || !win.drawConnectors || !win.drawLandmarks) {
      setErrorMessage("MediaPipe Holistic not loaded properly")
      return
    }

    const { Holistic, drawConnectors, drawLandmarks } = win
    const ctx = ctxRef.current
    if (!ctx) return

    const holistic = new Holistic({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
    })

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    holistic.onResults((results: any) => {
      lastDetectionTime.current = Date.now()

      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      const draw = (landmarks: any, color: string, radius = 1, width = 1) => {
        drawLandmarks(ctx, landmarks, { color, lineWidth: width, radius })
      }

      const connect = (landmarks: any, connections: any, color: string, width = 1) => {
        drawConnectors(ctx, landmarks, connections, { color, lineWidth: width })
      }

      // Face
      if (results.faceLandmarks) {
        connect(results.faceLandmarks, win.FACEMESH_TESSELATION, "#00FFFF", 1) // cyan
        draw(results.faceLandmarks, "#FF00FF", 1, 1) // magenta
      }

      // Hands
      const hands = [
        { data: results.leftHandLandmarks, label: "Left" },
        { data: results.rightHandLandmarks, label: "Right" },
      ]
      for (const hand of hands) {
        if (hand.data) {
          connect(hand.data, win.HAND_CONNECTIONS, "#00FF00", 2) // green lines
          draw(hand.data, "#FF0000", 3, 2) // red points
        }
      }

      // Optional Pose
      // if (results.poseLandmarks) {
      //   connect(results.poseLandmarks, win.POSE_CONNECTIONS, "#FFFF00", 2) // yellow
      //   draw(results.poseLandmarks, "#FFFFFF", 2, 1)
      // }
    })

    holisticRef.current = holistic
  }

  const toggleCamera = async () => {
    if (cameraActive) {
      cameraRef.current?.stop()
      const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks() || []
      tracks.forEach(t => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
      setCameraActive(false)
      return
    }

    await loadMediaPipe()
    if (!holisticRef.current) initHolistic()
    if (!videoRef.current) return

    if (typeof (window as any).Camera === "undefined") {
      setErrorMessage("Camera Utils not loaded")
      return
    }

    try {
      const camera = new (window as any).Camera(videoRef.current, {
        onFrame: async () => {
          const video = videoRef.current
          const ctx = ctxRef.current
          if (!ctx || !video || video.videoWidth === 0) return

          await holisticRef.current.send({ image: video })
        },
        width: 640,
        height: 480,
      })

      await new Promise((res) => setTimeout(res, 200))
      camera.start()
      cameraRef.current = camera
      setCameraActive(true)
    } catch (err) {
      setErrorMessage((err as Error).message)
    }
  }

  return (
    <div className="flex flex-col items-center p-4">
      {errorMessage && <div className="text-red-600 mb-2">{errorMessage}</div>}

      <button
        onClick={toggleCamera}
        disabled={loading}
        className={`mb-4 px-4 py-2 rounded text-white ${cameraActive ? 'bg-red-500' : 'bg-blue-500'}`}
      >
        {cameraActive ? 'Stop Camera' : loading ? 'Loading...' : 'Start Camera'}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <video ref={videoRef} className="w-full max-w-md rounded bg-gray-900" autoPlay muted playsInline />
        <canvas ref={canvasRef} className="w-full max-w-md rounded bg-black" />
      </div>

      {cameraActive && receiving && (
        <div className="mt-4 text-sm text-green-600">✅ Holistic detection active</div>
      )}
    </div>
  )
}
