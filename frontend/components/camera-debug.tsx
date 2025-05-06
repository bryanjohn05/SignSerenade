"use client"

import { useState, useEffect } from "react"

export default function CameraDebug() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    async function getDevices() {
      try {
        // First request permission to access media devices
        await navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            // Stop all tracks to release the camera
            stream.getTracks().forEach((track) => track.stop())
          })
          .catch((err) => {
            setError(`Permission error: ${err.message}`)
            return
          })

        // Then enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setDevices(videoDevices)
      } catch (err) {
        setError(`Error enumerating devices: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    getDevices()
  }, [])

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-md text-xs opacity-50 hover:opacity-100"
      >
        Debug Camera
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-md max-w-xs text-xs z-50">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">Camera Debug</h3>
        <button onClick={() => setShowDebug(false)}>×</button>
      </div>

      {error && <div className="text-red-400 mb-2">Error: {error}</div>}

      <div>
        <p className="mb-1">Available video devices: {devices.length}</p>
        <ul className="list-disc pl-4">
          {devices.map((device, index) => (
            <li key={device.deviceId} className="mb-1 truncate">
              {index + 1}. {device.label || `Camera ${index + 1}`}
            </li>
          ))}
        </ul>

        {devices.length === 0 && !error && (
          <p className="text-yellow-400">No video devices found or permission not granted.</p>
        )}
      </div>
    </div>
  )
}
