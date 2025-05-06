"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Camera, Trash2, RefreshCw } from "lucide-react"
import { useCamera } from "@/hooks/use-camera"
import { useModal } from "@/context/modal-context"

export default function CameraSettings() {
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const { permissionStatus, resetPermissionStatus, checkCameraPermission } = useCamera()
  const { showCameraPermission } = useModal()

  const handleResetPermissions = () => {
    resetPermissionStatus()
    setShowResetConfirm(false)
  }

  const handleRequestPermission = () => {
    showCameraPermission({
      forceShow: true, // Force show the permission dialog even if permission is already granted
    })
  }

  const getStatusColor = () => {
    switch (permissionStatus) {
      case "granted":
        return "text-green-500"
      case "denied":
        return "text-red-500"
      default:
        return "text-yellow-500"
    }
  }

  const getStatusText = () => {
    switch (permissionStatus) {
      case "granted":
        return "Granted"
      case "denied":
        return "Denied"
      default:
        return "Not requested"
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-black">Camera Permissions</h2>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-black">Current status:</p>
          <p className={`text-lg font-semibold ${getStatusColor()}`}>{getStatusText()}</p>
        </div>

        <div className="flex gap-2">
          <motion.button
            className="btn-primary"
            onClick={handleRequestPermission}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Camera className="w-5 h-5" />
            Request Permission
          </motion.button>

          <motion.button
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors"
            onClick={() => setShowResetConfirm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-5 h-5" />
            Reset
          </motion.button>
        </div>
      </div>

      {showResetConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 mb-4">
            This will reset your camera permission settings. You'll need to grant permission again the next time you use
            the camera.
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="bg-gray-200 text-gray-800 py-1 px-3 rounded hover:bg-gray-300 transition-colors"
              onClick={() => setShowResetConfirm(false)}
            >
              Cancel
            </button>
            <button
              className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition-colors flex items-center gap-1"
              onClick={handleResetPermissions}
            >
              <Trash2 className="w-4 h-4" />
              Reset Permissions
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>
          Camera permissions are stored in your browser and will be remembered between visits. You can reset permissions
          at any time.
        </p>
      </div>
    </div>
  )
}
