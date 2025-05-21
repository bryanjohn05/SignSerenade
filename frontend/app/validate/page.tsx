"use client"

import { useState, useRef, useEffect, type FormEvent } from "react"
import { motion } from "framer-motion"
import { Camera, Check, AlertCircle, Info } from "lucide-react"
import { validateSign } from "@/lib/api-client"
import { useModal } from "@/context/modal-context"
import { MODEL_SIGN_ACTIONS, API_CONFIG } from "@/config/api-config"
import { useCamera } from "@/hooks/use-camera"

export default function ValidatePage() {
  const [selectedSign, setSelectedSign] = useState("")
  const [referenceVideo, setReferenceVideo] = useState("")
  const [validationResult, setValidationResult] = useState<null | boolean>(null)
  const [videoError, setVideoError] = useState(false)
  const [availableSigns, setAvailableSigns] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null);

  const [captureInterval, setCaptureInterval] = useState(4)
  const [detections, setDetections] = useState<any[]>([])
  const [lastDetectedSign, setLastDetectedSign] = useState<string | null>(null)
  const [detectionHistory, setDetectionHistory] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [holisticLoaded, setHolisticLoaded] = useState(false)
  const holisticRef = useRef<any>(null)
  const lastDetectionTime = useRef<number>(0)
  const captureTimerRef = useRef<NodeJS.Timeout | null>(null)

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

  useEffect(() => {
    async function loadAvailableSigns() {
      try {
        const response = await fetch("/api/avail-signs")
        const data = await response.json()
        setAvailableSigns([...new Set(data.signs || MODEL_SIGN_ACTIONS)])
      } catch (error) {
        setAvailableSigns([...new Set(MODEL_SIGN_ACTIONS)])
      }
    }
    loadAvailableSigns()
  }, [])

  const handleSignSelection = async (e: FormEvent) => {
    e.preventDefault();
  
    if (inputRef.current && inputRef.current.value.trim()) {
      const sign = inputRef.current.value.trim();
  
      setSelectedSign(sign);
      setReferenceVideo(""); // Clear current video
      setVideoError(false);
  
      try {
        const videos = await validateSign(sign);
        if (videos.length > 0) {
          const newVideo = videos[0];
          setReferenceVideo(newVideo);
  
          // Wait for next render cycle so the video element updates
          requestAnimationFrame(() => {
            if (videoRef.current) {
              videoRef.current.load();
              videoRef.current.play().catch(() => {
                // Handle autoplay rejection if needed
              });
            }
          });
        } else {
          setVideoError(true);
        }
      } catch {
        setVideoError(true);
      }
    }
  };
  
  

  const handleVideoError = () => {
    setVideoError(true)
  }

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
      const holistic = new Holistic({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}` })

      holistic.setOptions({ modelComplexity: 0, smoothLandmarks: true, refineFaceLandmarks: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })

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

  useEffect(() => {
    loadAndInitHolistic()
  }, [])

  const captureAndDetect = async () => {
    if (!cameraActive || !cameraVideoRef.current || !canvasRef.current || isProcessing) return
    setIsProcessing(true)
    try {
      const video = cameraVideoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      if (!context) return

      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      if (holisticLoaded && holisticRef.current && video) {
        await holisticRef.current.send({ image: video })
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return
        const formData = new FormData()
        formData.append("image", blob, "capture.jpg")
        const res = await fetch(`${API_CONFIG.baseUrl}/detect`, { method: "POST", body: formData })
        const data = await res.json()
        if (data.success && data.detections?.length > 0) {
          const sorted = [...data.detections].sort((a, b) => b.confidence - a.confidence)
          setDetections(sorted)
          const top = sorted[0].class_name
          setLastDetectedSign(top)
          setDetectionHistory((prev) => {
            if (prev[prev.length - 1] !== top) {
              const newHist = [...prev, top]
              return newHist.length > 10 ? newHist.slice(-10) : newHist
            }
            return prev
          })
        } else {
          setDetections([])
        }
      }, "image/jpeg")
    } catch (err) {
      console.error("Detection failed:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const startCaptureInterval = () => {
    if (captureTimerRef.current) clearInterval(captureTimerRef.current)
    captureTimerRef.current = setInterval(() => captureAndDetect(), captureInterval * 1000)
  }

  useEffect(()=>{
    if (cameraActive) startCaptureInterval()
    else if (captureTimerRef.current) clearInterval(captureTimerRef.current)
    return () => captureTimerRef.current && clearInterval(captureTimerRef.current)
  }, [cameraActive])

  useEffect(() => {
    if (cameraActive && selectedSign && lastDetectedSign) {
      setValidationResult(lastDetectedSign.toLowerCase() === selectedSign.toLowerCase())
    }
  }, [lastDetectedSign, selectedSign, cameraActive])

  const handleToggleCamera = async () => {
    if (!selectedSign) return alert("Please select a sign to validate first!")

    if (cameraActive) {
      toggleCamera()
      if (captureTimerRef.current) clearInterval(captureTimerRef.current)

      // Clear the canvas overlay
      const ctx = canvasRef.current?.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      }

      return
    }

    try {
      const success = await startCamera(false)
      if (success && holisticLoaded) startCaptureInterval()
    } catch (err) {
      console.error("Camera access error:", err)
    }
  }


  return (
    <div className="bg-gradient-to-b from-[#4a628a] to-[#c7d7f5] min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-4xl font-bold mb-8 text-white text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Sign Validator
        </motion.h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section: Select Sign */}
          <motion.div
            className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Select Sign to Validate</h2>
            </div>

            <div className="p-6">
              <form onSubmit={handleSignSelection} className="mb-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="sign-select" className="block text-sm font-medium text-gray-700 mb-1">
                      Choose a sign or type your own:
                    </label>
                    <input
                      ref={inputRef}
                      list="signs-list"
                      id="sign-select"
                      type="text"
                      placeholder="Enter or select a sign..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                    {/* <datalist id="signs-list">
                    {availableSigns.map((sign) => (
                      <option key={sign} value={sign} />
                    ))}
                  </datalist> */}
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Select Sign
                  </motion.button>
                </div>
              </form>

              <hr className="border-gray-200 my-6" />

              {selectedSign ? (
                <div className="flex flex-col items-center">
                  <h2 className="text-2xl font-semibold mb-4 text-black">Reference Sign Video: {selectedSign}</h2>

                  {videoError ? (
                    <div className="w-full aspect-video bg-gray-100 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                      <Info className="w-12 h-12 text-yellow-500 mb-2" />
                      <h3 className="text-lg font-bold mb-1">Video Not Available</h3>
                      <p className="text-sm text-gray-500">
                        The sign video for "{selectedSign}" could not be found in your library.
                      </p>
                      <p className="text-xs text-gray-400 mt-2">Try one of the available signs from the dropdown list.</p>
                    </div>
                  ) : (
                    <div className="w-full max-w-md">
                      <video
                        ref={videoRef}
                        style={{ transform: "scaleX(-1)" }}
                        className="w-full rounded-lg border-2 border-gray-200 shadow-md"
                        autoPlay
                        loop
                        controls
                        muted
                        onError={handleVideoError}
                      >
                        <source src={referenceVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl p-8 text-center">
                  <p className="text-gray-500">Select a sign to see the reference video</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Section: Camera Validation */}
          <motion.div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Validate Your Sign</h2>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <motion.button className={`py-3 px-6 rounded-lg font-medium transition-all flex items-center gap-2 ${cameraActive ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"}`} onClick={handleToggleCamera} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={!selectedSign}>
                  <Camera className="w-5 h-5" />
                  {cameraActive ? "Stop Validation" : "Start Validation"}
                </motion.button>
              </div>
              <hr className="border-gray-200 my-6" />
              <div className="flex flex-col items-center">
                <div className="relative w-full aspect-video bg-black/10 rounded-xl overflow-hidden shadow-lg">
                  <div className="relative w-full h-full">
                    <video ref={cameraVideoRef} className="w-full h-full object-cover  absolute top-0 left-0" autoPlay playsInline style={{ transform: "scaleX(-1)" }} muted />
                    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ transform: "scaleX(-1)" }}/>
                  </div>
                </div>
                <motion.div className="mt-6 text-xl font-semibold" animate={{ scale: validationResult !== null ? [1, 1.1, 1] : 1, transition: { duration: 0.5 } }}>
                  {validationResult === null ? (
                    <span className="text-black">Waiting for detection...</span>
                  ) : validationResult ? (
                    <span className="text-green-500 flex items-center gap-2">
                      <Check className="w-5 h-5" /> Correct! "{lastDetectedSign}" matches "{selectedSign}"
                    </span>
                  ) : (
                    <span className="text-red-500">
                      Incorrect. Detected "{lastDetectedSign}", expected "{selectedSign}"
                    </span>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
