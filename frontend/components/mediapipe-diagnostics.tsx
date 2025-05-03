"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, Loader2, RefreshCw, ExternalLink } from "lucide-react"

export default function MediaPipeDiagnostics() {
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mediapipeStatus, setMediapipeStatus] = useState<"loading" | "available" | "unavailable">("loading")
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [browserInfo, setBrowserInfo] = useState<string>("")
  const [isWebGLAvailable, setIsWebGLAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    if (showDiagnostics) {
      checkMediaPipeAvailability()
      checkBrowserInfo()
      checkWebGLSupport()
    }
  }, [showDiagnostics])

  const checkMediaPipeAvailability = async () => {
    setIsLoading(true)
    setMediapipeStatus("loading")
    setErrorDetails(null)

    try {
      // Try to dynamically import MediaPipe
      const mediaPipeModule = await import("@mediapipe/hands")

      if (mediaPipeModule && mediaPipeModule.Hands) {
        setMediapipeStatus("available")
      } else {
        setMediapipeStatus("unavailable")
        setErrorDetails("MediaPipe module loaded but Hands class is not available")
      }
    } catch (error) {
      console.error("Error loading MediaPipe:", error)
      setMediapipeStatus("unavailable")
      setErrorDetails(error instanceof Error ? error.message : String(error))
    } finally {
      setIsLoading(false)
    }
  }

  const checkBrowserInfo = () => {
    const browser = {
      name: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      vendor: navigator.vendor,
      cookiesEnabled: navigator.cookieEnabled,
    }
    setBrowserInfo(JSON.stringify(browser, null, 2))
  }

  const checkWebGLSupport = () => {
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      setIsWebGLAvailable(!!gl)
    } catch (e) {
      setIsWebGLAvailable(false)
    }
  }

  if (!showDiagnostics) {
    return (
      <button
        onClick={() => setShowDiagnostics(true)}
        className="fixed bottom-40 right-4 bg-yellow-600 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1 z-50"
      >
        <AlertCircle className="w-3 h-3" />
        MediaPipe Diagnostics
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              MediaPipe Diagnostics
            </h2>
            <button onClick={() => setShowDiagnostics(false)} className="text-white/80 hover:text-white">
              ×
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              <div>
                <p className="text-yellow-700 font-medium">MediaPipe Loading Issue Detected</p>
                <p className="text-yellow-600 text-sm mt-1">
                  Your application is running in fallback mode with simplified hand tracking because MediaPipe libraries
                  could not be loaded.
                </p>
              </div>
            </div>
          </div>

          {/* MediaPipe Status */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">MediaPipe Status</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              {isLoading ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Checking MediaPipe availability...</span>
                </div>
              ) : mediapipeStatus === "available" ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>MediaPipe is available</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>MediaPipe is not available</span>
                </div>
              )}

              {errorDetails && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                  <p className="font-medium">Error Details:</p>
                  <p className="font-mono text-xs mt-1 break-all">{errorDetails}</p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={checkMediaPipeAvailability}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Check Again
                </button>
              </div>
            </div>
          </div>

          {/* WebGL Support */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">WebGL Support</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              {isWebGLAvailable === null ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Checking WebGL support...</span>
                </div>
              ) : isWebGLAvailable ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>WebGL is supported</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>WebGL is not supported - MediaPipe requires WebGL</span>
                </div>
              )}
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">How to Fix MediaPipe Issues</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>
                  <span className="font-medium">Install MediaPipe dependencies:</span>
                  <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                    npm install @mediapipe/hands @mediapipe/camera_utils @mediapipe/drawing_utils
                  </pre>
                </li>
                <li>
                  <span className="font-medium">Copy MediaPipe WASM files to public directory:</span>
                  <p className="text-xs mt-1 text-gray-600">
                    MediaPipe requires WASM files to be accessible. Copy them from node_modules/@mediapipe/hands to your
                    public directory.
                  </p>
                </li>
                <li>
                  <span className="font-medium">Check browser compatibility:</span>
                  <p className="text-xs mt-1 text-gray-600">
                    MediaPipe works best in Chrome, Edge, and Firefox. Make sure you're using a supported browser and
                    it's up to date.
                  </p>
                </li>
                <li>
                  <span className="font-medium">Verify WebGL support:</span>
                  <p className="text-xs mt-1 text-gray-600">
                    MediaPipe requires WebGL. Make sure your browser and graphics drivers support WebGL.
                  </p>
                </li>
              </ol>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="https://developers.google.com/mediapipe/solutions/vision/hand_landmarker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  MediaPipe Documentation
                </a>
                <a
                  href="https://get.webgl.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Test WebGL Support
                </a>
              </div>
            </div>
          </div>

          {/* Browser Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Browser Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs max-h-40">{browserInfo}</pre>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-3 flex justify-between">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
          <button
            onClick={() => setShowDiagnostics(false)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}
