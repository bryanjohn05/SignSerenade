"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, ShieldAlert, ShieldCheck, Settings, ExternalLink, X } from "lucide-react"
import Image from "next/image"

type PermissionState = "prompt" | "granted" | "denied" | "unavailable" | "checking"

interface CameraPermissionProps {
  onPermissionGranted?: () => void
  onPermissionDenied?: () => void
  onClose?: () => void
  showCloseButton?: boolean
  fullScreen?: boolean
}

export default function CameraPermission({
  onPermissionGranted,
  onPermissionDenied,
  onClose,
  showCloseButton = true,
  fullScreen = false,
}: CameraPermissionProps) {
  const [permissionState, setPermissionState] = useState<PermissionState>("checking")
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    checkCameraPermission()
  }, [])

  const checkCameraPermission = async () => {
    try {
      // Check if navigator.permissions is supported
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: "camera" as PermissionName })

          const handleStateChange = () => {
            setPermissionState(result.state as PermissionState)

            if (result.state === "granted") {
              onPermissionGranted?.()
            } else if (result.state === "denied") {
              onPermissionDenied?.()
            }
          }

          // Initial state
          handleStateChange()

          // Listen for changes
          result.addEventListener("change", handleStateChange)

          return () => {
            result.removeEventListener("change", handleStateChange)
          }
        } catch (err) {
          console.error("Error querying camera permission:", err)
          // Fall back to getUserMedia check
        }
      }

      // Fallback: try to access the camera directly
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach((track) => track.stop())
        setPermissionState("granted")
        onPermissionGranted?.()
      } catch (err) {
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setPermissionState("denied")
          onPermissionDenied?.()
        } else if (err instanceof DOMException && err.name === "NotFoundError") {
          setPermissionState("unavailable")
        } else {
          console.error("Error accessing camera:", err)
          setPermissionState("unavailable")
        }
      }
    } catch (err) {
      console.error("Error checking camera permission:", err)
      setPermissionState("unavailable")
    }
  }

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach((track) => track.stop())
      setPermissionState("granted")
      onPermissionGranted?.()
    } catch (err) {
      console.error("Error requesting camera permission:", err)
      setPermissionState("denied")
      onPermissionDenied?.()
    }
  }

  const handleClose = () => {
    onClose?.()
  }

  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    : "relative w-full max-w-md mx-auto"

  return (
    <AnimatePresence>
      <motion.div className={containerClass} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-md">
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}

          <div className="bg-gradient-to-r from-[#4a628a] to-[#223454] p-6 text-white text-center">
            <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Camera size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Camera Access Required</h2>
            <p className="text-white/80">SignSerenade needs camera access to recognize your sign language gestures</p>
          </div>

          <div className="p-6">
            {permissionState === "checking" && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#4a628a] border-r-transparent align-[-0.125em]"></div>
                <p className="mt-4 text-gray-600">Checking camera permission...</p>
              </div>
            )}

            {permissionState === "prompt" && (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <ShieldAlert size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Permission Required</h3>
                    <p className="text-gray-600 text-sm">
                      Your browser will ask for permission to use your camera. Please click "Allow" when prompted.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-center mb-4">
                    <Image
                      src="/camera-permission-dialog.png"
                      alt="Browser permission dialog example"
                      width={300}
                      height={100}
                      className="rounded border border-gray-200"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">Example of permission dialog that may appear</p>
                </div>

                <button
                  onClick={requestPermission}
                  className="w-full py-3 px-4 bg-[#4a628a] hover:bg-[#223454] text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Camera size={18} />
                  <span>Allow Camera Access</span>
                </button>
              </div>
            )}

            {permissionState === "granted" && (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <ShieldCheck size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Permission Granted</h3>
                    <p className="text-gray-600 text-sm">
                      Thank you! You can now use all the sign language recognition features.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-3 px-4 bg-[#4a628a] hover:bg-[#223454] text-white rounded-lg font-medium transition-colors"
                >
                  Continue to App
                </button>
              </div>
            )}

            {permissionState === "denied" && (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-red-100 p-2 rounded-full">
                    <ShieldAlert size={24} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Permission Denied</h3>
                    <p className="text-gray-600 text-sm">
                      Camera access was denied. You'll need to enable it in your browser settings to use sign language
                      recognition.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Settings size={18} />
                    <span>{showInstructions ? "Hide Instructions" : "Show Instructions"}</span>
                  </button>

                  <button
                    onClick={requestPermission}
                    className="w-full py-2 px-4 bg-[#4a628a] hover:bg-[#223454] text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Camera size={18} />
                    <span>Try Again</span>
                  </button>
                </div>

                {showInstructions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 rounded-lg p-4 space-y-4"
                  >
                    <h4 className="font-medium text-gray-800">How to enable camera access:</h4>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Chrome / Edge:</p>
                      <ol className="text-xs text-gray-600 list-decimal pl-4 space-y-1">
                        <li>Click the lock/info icon in the address bar</li>
                        <li>Select "Site settings" or "Permissions"</li>
                        <li>Find "Camera" and change to "Allow"</li>
                        <li>Refresh the page</li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Firefox:</p>
                      <ol className="text-xs text-gray-600 list-decimal pl-4 space-y-1">
                        <li>Click the shield icon in the address bar</li>
                        <li>Click "Connection secure"</li>
                        <li>Click "More Information"</li>
                        <li>Go to "Permissions" tab</li>
                        <li>Find "Use the Camera" and remove the setting or set to "Allow"</li>
                        <li>Refresh the page</li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Safari:</p>
                      <ol className="text-xs text-gray-600 list-decimal pl-4 space-y-1">
                        <li>Click Safari in the menu bar</li>
                        <li>Select "Settings for This Website"</li>
                        <li>Find "Camera" and select "Allow"</li>
                        <li>Refresh the page</li>
                      </ol>
                    </div>

                    <a
                      href="https://support.google.com/chrome/answer/2693767?hl=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <span>More help with camera permissions</span>
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                  </motion.div>
                )}
              </div>
            )}

            {permissionState === "unavailable" && (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <ShieldAlert size={24} className="text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Camera Unavailable</h3>
                    <p className="text-gray-600 text-sm">
                      We couldn't detect a camera on your device, or your browser doesn't support camera access.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Troubleshooting:</h4>
                  <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
                    <li>Make sure your device has a camera</li>
                    <li>Check if other applications can access your camera</li>
                    <li>Try using a different browser (Chrome or Firefox recommended)</li>
                    <li>Make sure your camera is not being used by another application</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                  >
                    Continue Without Camera
                  </button>

                  <button
                    onClick={checkCameraPermission}
                    className="flex-1 py-2 px-4 bg-[#4a628a] hover:bg-[#223454] text-white rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
