"use client"

import { useState, useEffect } from "react"
import { Server, AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react"
import { API_CONFIG } from "@/config/api-config"

export default function BackendDebug() {
  const [showDebug, setShowDebug] = useState(false)
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [responseDetails, setResponseDetails] = useState<any>(null)

  const checkBackendConnection = async () => {
    setStatus("checking")
    setErrorMessage(null)

    try {
      console.log(`Checking backend connection at: ${API_CONFIG.baseUrl}/health`)
      const response = await fetch(`${API_CONFIG.baseUrl}/health`, {
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        setStatus("error")
        setErrorMessage(`Server returned status: ${response.status} ${response.statusText}`)
        return
      }

      const data = await response.json()
      setResponseDetails(data)

      if (data.status === "healthy" || data.model_loaded === true) {
        setStatus("connected")
      } else {
        setStatus("error")
        setErrorMessage("Backend is reachable but model is not loaded")
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage(`Connection error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  useEffect(() => {
    if (showDebug) {
      checkBackendConnection()
    }
  }, [showDebug])

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-md text-xs opacity-50 hover:opacity-100 flex items-center gap-1"
      >
        <Server className="w-3 h-3" />
        Debug Backend
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-md max-w-xs text-xs z-50">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">Backend Debug</h3>
        <button onClick={() => setShowDebug(false)}>×</button>
      </div>

      <div className="mb-2">
        <div className="flex items-center gap-1">
          <span>Backend URL:</span>
          <span className="font-mono">{API_CONFIG.baseUrl}</span>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-center gap-1">
          <span>Status:</span>
          {status === "checking" && (
            <span className="flex items-center">
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              Checking...
            </span>
          )}
          {status === "connected" && (
            <span className="flex items-center text-green-400">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center text-red-400">
              <AlertCircle className="w-3 h-3 mr-1" />
              Error
            </span>
          )}
        </div>
      </div>

      {errorMessage && <div className="text-red-400 mb-2 text-[10px] break-words">Error: {errorMessage}</div>}

      {responseDetails && (
        <div className="mb-2 text-[10px]">
          <div className="font-bold mb-1">Response:</div>
          <pre className="bg-gray-900 p-1 rounded overflow-auto max-h-20">
            {JSON.stringify(responseDetails, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex justify-center mt-3">
        <button
          onClick={checkBackendConnection}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Retry Connection
        </button>
      </div>
    </div>
  )
}
