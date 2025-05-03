"use client"

import { useState, useRef, type FormEvent, useEffect } from "react"
import { motion } from "framer-motion"
import { Camera, Check, AlertCircle, Info } from "lucide-react"
import { useCamera } from "@/hooks/use-camera"
import { validateSign } from "@/lib/api-client"
import { useModal } from "@/context/modal-context"
import { SIGN_ACTIONS } from "@/config/api-config"

export default function ValidatePage() {
  const [selectedSign, setSelectedSign] = useState("")
  const [referenceVideo, setReferenceVideo] = useState("")
  const [validationResult, setValidationResult] = useState<null | boolean>(null)
  const [videoError, setVideoError] = useState(false)
  const [availableSigns, setAvailableSigns] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const {
    videoRef: cameraVideoRef,
    canvasRef,
    isActive: cameraActive,
    detectedAction,
    permissionDenied,
    permissionStatus,
    toggleCamera,
    startCamera,
    startDetection,
  } = useCamera()

  const { showCameraPermission } = useModal()

  // Load available signs
  useEffect(() => {
    async function loadAvailableSigns() {
      try {
        const response = await fetch("/api/available-signs")
        const data = await response.json()
        setAvailableSigns(data.signs || SIGN_ACTIONS)
      } catch (error) {
        console.error("Error loading available signs:", error)
        setAvailableSigns(SIGN_ACTIONS)
      }
    }

    loadAvailableSigns()
  }, [])

  // Handle sign selection
  const handleSignSelection = async (e: FormEvent) => {
    e.preventDefault()

    if (inputRef.current && inputRef.current.value.trim()) {
      const sign = inputRef.current.value.trim()
      setSelectedSign(sign)
      setVideoError(false)

      try {
        const videos = await validateSign(sign)
        if (videos.length > 0) {
          setReferenceVideo(videos[0])
        } else {
          setVideoError(true)
        }
      } catch (error) {
        console.error("Error validating sign:", error)
        setVideoError(true)
      }
    }
  }

  // Handle video error
  const handleVideoError = () => {
    console.error("Error loading video:", referenceVideo)
    setVideoError(true)
  }

  // Toggle camera for validation
  const handleToggleCamera = async () => {
    if (!selectedSign) {
      alert("Please select a sign to validate first!")
      return
    }

    if (cameraActive) {
      // If camera is already active, just turn it off
      toggleCamera()
      return
    }

    // If permission is already granted, start camera directly
    if (permissionStatus === "granted") {
      console.log("Permission already granted, starting camera directly")
      // Ensure the video ref is ready before starting the camera
      setTimeout(async () => {
        const success = await startCamera(true) // Skip permission check
        if (success) {
          startDetection(3000)
        } else {
          console.error("Failed to start camera even though permission was granted")
        }
      }, 100)
      return
    }

    // If permission is unknown or denied, show permission UI
    showCameraPermission({
      onPermissionGranted: async () => {
        console.log("Permission granted, starting camera")
        // Add a small delay to ensure DOM elements are ready
        setTimeout(async () => {
          const success = await startCamera(true) // Skip permission check since we just got permission
          if (success) {
            startDetection(3000)
          } else {
            console.error("Failed to start camera after permission was granted")
          }
        }, 100)
      },
      onPermissionDenied: () => {
        console.log("Permission denied")
      },
    })
  }

  // Check if detected action matches selected sign
  const validateAction = () => {
    if (!selectedSign || detectedAction === "Waiting...") return null

    return detectedAction.toLowerCase() === selectedSign.toLowerCase()
  }

  // Update validation result when detected action changes
  useState(() => {
    if (cameraActive && selectedSign && detectedAction !== "Waiting...") {
      setValidationResult(validateAction())
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        className="text-4xl font-bold mb-8 text-black text-center"
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
                  <datalist id="signs-list">
                    {availableSigns.map((sign) => (
                      <option key={sign} value={sign} />
                    ))}
                  </datalist>
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
                      className="w-full rounded-lg border-2 border-gray-200 shadow-md"
                      autoPlay
                      loop
                      controls
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
        <motion.div
          className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Validate Your Sign</h2>
          </div>

          <div className="p-6">
            <div className="flex justify-center mb-6">
              <motion.button
                className={`py-3 px-6 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  cameraActive
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                }`}
                onClick={handleToggleCamera}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!selectedSign}
              >
                <Camera className="w-5 h-5" />
                {cameraActive ? "Stop Validation" : "Start Validation"}
              </motion.button>
            </div>

            <hr className="border-gray-200 my-6" />

            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-video bg-black/10 rounded-xl overflow-hidden shadow-lg">
                {cameraActive ? (
                  <>
                    <video ref={cameraVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    {permissionDenied ? (
                      <div className="text-center p-4">
                        <AlertCircle className="w-10 h-10 mx-auto mb-2 text-red-500" />
                        <p>Camera access denied. Click "Start Validation" to request permission again.</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>Camera feed will appear here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <motion.div
                className="mt-6 text-xl font-semibold"
                animate={{
                  scale: detectedAction !== "Waiting..." ? [1, 1.1, 1] : 1,
                  transition: { duration: 0.5 },
                }}
              >
                {validationResult === null ? (
                  <span className="text-black">Detected Action: {detectedAction}</span>
                ) : validationResult ? (
                  <span className="text-green-500 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Correct! "{detectedAction}" matches "{selectedSign}"
                  </span>
                ) : (
                  <span className="text-red-500">
                    Incorrect. Detected "{detectedAction}", expected "{selectedSign}"
                  </span>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
