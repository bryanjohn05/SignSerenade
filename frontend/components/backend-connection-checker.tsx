"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Server, AlertCircle, CheckCircle, Loader2, RefreshCw, Settings } from "lucide-react"
import { API_CONFIG } from "@/config/api-config"

export default function BackendConnectionChecker() {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [responseDetails, setResponseDetails] = useState<any>(null)
  const [customUrl, setCustomUrl] = useState<string>(API_CONFIG.baseUrl)
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [isTestingCustomUrl, setIsTestingCustomUrl] = useState(false)
  const [commonPorts, setCommonPorts] = useState<
    { port: string; status: "checking" | "success" | "error" | "pending" }[]
  >([
    { port: "3000", status: "pending" },
    { port: "5000", status: "pending" },
    { port: "8000", status: "pending" },
    { port: "8080", status: "pending" },
  ])

  const checkBackendConnection = async (url = API_CONFIG.baseUrl) => {
    setStatus("checking")
    setErrorMessage(null)

    try {
      console.log(`Checking backend connection at: ${url}/health`)
      const response = await fetch(`${url}/health`, {
        signal: AbortSignal.timeout(3000),
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        setStatus("error")
        setErrorMessage(`Server returned status: ${response.status} ${response.statusText}`)
        return false
      }

      const data = await response.json()
      setResponseDetails(data)

      if (data.status === "healthy" || data.model_loaded === true) {
        setStatus("connected")
        return true
      } else {
        setStatus("error")
        setErrorMessage("Backend is reachable but model is not loaded")
        return false
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage(`Connection error: ${error instanceof Error ? error.message : String(error)}`)
      return false
    }
  }

  const checkPort = async (port: string) => {
    // Update the port status to checking
    setCommonPorts((prev) => prev.map((p) => (p.port === port ? { ...p, status: "checking" } : p)))

    try {
      const baseUrl = window.location.protocol + "//" + window.location.hostname + ":" + port
      console.log(`Checking port ${port} at ${baseUrl}/health`)

      const response = await fetch(`${baseUrl}/health`, {
        signal: AbortSignal.timeout(2000),
        cache: "no-store",
      })

      if (response.ok) {
        // Update the port status to success
        setCommonPorts((prev) => prev.map((p) => (p.port === port ? { ...p, status: "success" } : p)))
        return true
      } else {
        // Update the port status to error
        setCommonPorts((prev) => prev.map((p) => (p.port === port ? { ...p, status: "error" } : p)))
        return false
      }
    } catch (error) {
      // Update the port status to error
      setCommonPorts((prev) => prev.map((p) => (p.port === port ? { ...p, status: "error" } : p)))
      return false
    }
  }

  const scanCommonPorts = async () => {
    // Reset all ports to pending
    setCommonPorts((prev) => prev.map((p) => ({ ...p, status: "pending" })))

    // Check each port
    for (const portInfo of commonPorts) {
      await checkPort(portInfo.port)
    }
  }

  const applyCustomUrl = async () => {
    setIsTestingCustomUrl(true)
    const success = await checkBackendConnection(customUrl)
    setIsTestingCustomUrl(false)

    if (success) {
      // Store the custom URL in localStorage for persistence
      localStorage.setItem("backend_url", customUrl)
      // Force reload the page to apply the new URL
      window.location.reload()
    }
  }

  useEffect(() => {
    // Check if we have a stored custom URL
    const storedUrl = localStorage.getItem("backend_url")
    if (storedUrl) {
      setCustomUrl(storedUrl)
    }

    if (isOpen) {
      checkBackendConnection()
    }
  }, [isOpen])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-30 right-4 bg-gradient-to-r from-blue-400 to-purple-600 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1 z-50"
      >
        <AlertCircle className="w-4 h-4" />
        Backend Connection
      </button>
    )
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Server className="w-5 h-5" />
              Backend Connection Troubleshooter
            </h2>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">Current Backend URL</h3>
              <button
                onClick={() => setIsEditingUrl(!isEditingUrl)}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                {isEditingUrl ? "Cancel" : "Change"}
              </button>
            </div>

            {isEditingUrl ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="http://localhost:5000"
                />
                <button
                  onClick={applyCustomUrl}
                  disabled={isTestingCustomUrl}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm flex items-center gap-1"
                >
                  {isTestingCustomUrl ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testing
                    </>
                  ) : (
                    <>Apply</>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-gray-100 px-3 py-2 rounded-md font-mono text-sm break-all">{API_CONFIG.baseUrl}</div>
            )}
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Connection Status</h3>
            <div className="bg-gray-100 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <span>Status:</span>
                {status === "checking" && (
                  <span className="flex items-center text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    Checking...
                  </span>
                )}
                {status === "connected" && (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Connected
                  </span>
                )}
                {status === "error" && (
                  <span className="flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Error
                  </span>
                )}
              </div>

              {errorMessage && <div className="mt-2 text-red-600 text-sm break-words">{errorMessage}</div>}

              {responseDetails && status === "connected" && (
                <div className="mt-2 text-sm text-green-600">Backend is healthy and model is loaded!</div>
              )}
            </div>
          </div>

          {status === "error" && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Port Scanner</h3>
              <p className="text-sm text-gray-600 mb-2">Let's check if your backend is running on a different port:</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {commonPorts.map((portInfo) => (
                  <div
                    key={portInfo.port}
                    className={`p-2 rounded-md text-sm flex items-center justify-between ${
                      portInfo.status === "success"
                        ? "bg-green-100 text-green-800"
                        : portInfo.status === "error"
                          ? "bg-red-50 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <span>Port {portInfo.port}</span>
                    {portInfo.status === "checking" && <Loader2 className="w-3 h-3 animate-spin" />}
                    {portInfo.status === "success" && <CheckCircle className="w-3 h-3" />}
                    {portInfo.status === "error" && <AlertCircle className="w-3 h-3" />}
                    {portInfo.status === "pending" && <span className="w-3 h-3" />}
                  </div>
                ))}
              </div>

              <button
                onClick={scanCommonPorts}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Scan Common Ports
              </button>
            </div>
          )}

          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-medium text-gray-800">Troubleshooting Steps:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Make sure your Flask backend is running</li>
              <li>Check if it's running on a different port (use the port scanner)</li>
              <li>Verify the NEXT_PUBLIC_API_URL environment variable</li>
              <li>Check for CORS issues in your Flask backend</li>
              <li>Ensure your model file exists at the specified path</li>
            </ol>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => checkBackendConnection()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
