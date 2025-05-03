"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Camera, Bug, RefreshCw, Loader2, CheckCircle, AlertCircle, Info, FileUp } from "lucide-react"
import { API_CONFIG } from "@/config/api-config"

interface ModelInfo {
  loaded: boolean
  loading?: boolean
  model_path?: string
  model_classes?: Record<string, string>
  num_classes?: number
  class_names?: string[]
  error?: string
}

export default function DetectionDebugger() {
  const [showDebugger, setShowDebugger] = useState(false)
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testDetectionResult, setTestDetectionResult] = useState<any>(null)
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [detectionResult, setDetectionResult] = useState<any>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isReloadingModel, setIsReloadingModel] = useState(false)
  const [modelPath, setModelPath] = useState<string>("best.pt");
  const [versionInfo, setVersionInfo] = useState<any>(null)

  // Fetch model info
  const fetchModelInfo = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/model_info`)
      const data = await response.json()
      setModelInfo(data)
    } catch (error) {
      console.error("Error fetching model info:", error)
      setError(`Failed to fetch model info: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Check health status
  const checkHealth = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/health`)
      const data = await response.json()
      setHealthStatus(data)
    } catch (error) {
      console.error("Error checking health:", error)
      setError(`Failed to check health: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Get version info
  const fetchVersionInfo = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/model_version`)
      const data = await response.json()
      setVersionInfo(data)
    } catch (error) {
      console.error("Error fetching version info:", error)
    }
  }

  // Run test detection
  const runTestDetection = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/test_detect`)
      const data = await response.json()
      setTestDetectionResult(data)
    } catch (error) {
      console.error("Error running test detection:", error)
      setError(`Failed to run test detection: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Debug model results structure
  const debugModelResults = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/debug_model`, {
        method: "POST",
      })

      const data = await response.json()
      setTestDetectionResult(data)
    } catch (error) {
      console.error("Error debugging model:", error)
      setError(`Failed to debug model: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Run detection with selected file
  const runDetection = async () => {
    if (!selectedFile) {
      setError("Please select a file first")
      return
    }

    setIsDetecting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", selectedFile)

      const response = await fetch(`${API_CONFIG.baseUrl}/detect`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setDetectionResult(data)
    } catch (error) {
      console.error("Error running detection:", error)
      setError(`Failed to run detection: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsDetecting(false)
    }
  }

  // Reload the model
  const reloadModel = async () => {
    setIsReloadingModel(true)
    setError(null)

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/reload_model`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model_path: modelPath }),
      })

      const data = await response.json()

      if (data.success) {
        // Wait a moment for the model to start loading
        setTimeout(() => {
          fetchModelInfo()
        }, 1000)
      } else {
        setError(`Failed to reload model: ${data.error}`)
      }
    } catch (error) {
      console.error("Error reloading model:", error)
      setError(`Failed to reload model: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsReloadingModel(false)
    }
  }

  // Load initial data when debugger is opened
  useEffect(() => {
    if (showDebugger) {
      fetchModelInfo()
      checkHealth()
      fetchVersionInfo()
    }
  }, [showDebugger])

  // Poll for model info if it's loading
  useEffect(() => {
    if (modelInfo?.loading) {
      const interval = setInterval(() => {
        fetchModelInfo()
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [modelInfo])

  if (!showDebugger) {
    return (
      <button
        onClick={() => setShowDebugger(true)}
        className="fixed bottom-28 right-4 bg-red-600 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1 z-50"
      >
        <Bug className="w-3 h-3" />
        Detection Debugger
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Detection Debugger
            </h2>
            <button onClick={() => setShowDebugger(false)} className="text-white/80 hover:text-white">
              ×
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backend Connection */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Backend Connection
              </h3>
              <div className="text-sm">
                <p className="mb-1">
                  <span className="font-medium">URL:</span> {API_CONFIG.baseUrl}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={checkHealth}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Check Health
                  </button>
                </div>

                {healthStatus && (
                  <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-xs">
                    <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                      {JSON.stringify(healthStatus, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Model Info */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Model Information</h3>
              <div className="text-sm">
                {modelInfo ? (
                  <>
                    <p className="mb-1">
                      <span className="font-medium">Status:</span>{" "}
                      {modelInfo.loading ? (
                        <span className="text-blue-600 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Loading
                        </span>
                      ) : modelInfo.loaded ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Loaded
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Not Loaded
                        </span>
                      )}
                    </p>
                    {modelInfo.model_path && (
                      <p className="mb-1">
                        <span className="font-medium">Path:</span> {modelInfo.model_path}
                      </p>
                    )}
                    {modelInfo.num_classes && (
                      <p className="mb-1">
                        <span className="font-medium">Classes:</span> {modelInfo.num_classes}
                      </p>
                    )}
                    {modelInfo.error && (
                      <p className="text-red-600 mb-1">
                        <span className="font-medium">Error:</span> {modelInfo.error}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 italic">No model information available</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={fetchModelInfo}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Refresh Model Info
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reload Model */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Reload Model</h3>
            <p className="text-sm text-gray-600 mb-3">
              If the model failed to load, you can try reloading it. Make sure the model file exists at the specified
              path.
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={modelPath}
                  onChange={(e) => setModelPath(e.target.value)}
                  placeholder="Path to model file"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={reloadModel}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2"
                  disabled={isReloadingModel}
                >
                  {isReloadingModel ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                  Reload Model
                </button>
              </div>

              {versionInfo && (
                <div className="mt-2 text-xs text-gray-500">
                  <p>PyTorch: {versionInfo.pytorch_version}</p>
                  <p>OpenCV: {versionInfo.opencv_version}</p>
                  <p>Python: {versionInfo.python_version}</p>
                </div>
              )}
            </div>
          </div>

          {/* Test Detection */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Test Detection</h3>
            <p className="text-sm text-gray-600 mb-3">
              Run a test detection with a simple image to verify the model is working correctly.
            </p>
            <div className="flex gap-2">
              <button
                onClick={runTestDetection}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
                Run Test Detection
              </button>

              <button
                onClick={debugModelResults}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Info className="w-4 h-4" />}
                Debug Model Structure
              </button>
            </div>

            {testDetectionResult && (
              <div className="mt-3 p-3 bg-white rounded border border-gray-200 text-xs">
                <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                  {JSON.stringify(testDetectionResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Custom Detection */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Custom Detection</h3>
            <p className="text-sm text-gray-600 mb-3">Upload an image to test detection with your own content.</p>

            <div className="flex flex-col gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />

              {selectedFile && (
                <div className="text-sm">
                  <p>Selected file: {selectedFile.name}</p>
                  <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              )}

              <button
                onClick={runDetection}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 w-fit"
                disabled={isDetecting || !selectedFile}
              >
                {isDetecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                Run Detection
              </button>
            </div>

            {detectionResult && (
              <div className="mt-3 p-3 bg-white rounded border border-gray-200 text-xs">
                <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                  {JSON.stringify(detectionResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Class Names */}
          {modelInfo?.class_names && modelInfo.class_names.length > 0 && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Model Classes</h3>
              <div className="flex flex-wrap gap-2">
                {modelInfo.class_names.map((className, index) => (
                  <span key={index} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {className}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          <button
            onClick={() => setShowDebugger(false)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}
