"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import CameraPermission from "@/components/camera-permission"

// Key for storing permission status in localStorage
const CAMERA_PERMISSION_KEY = "signserenade-camera-permission"

interface ModalContextType {
  showCameraPermission: (options?: {
    onPermissionGranted?: () => void
    onPermissionDenied?: () => void
    fullScreen?: boolean
    forceShow?: boolean
  }) => void
  hideCameraPermission: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [permissionOptions, setPermissionOptions] = useState<{
    onPermissionGranted?: () => void
    onPermissionDenied?: () => void
    fullScreen?: boolean
    forceShow?: boolean
  }>({})

  const showCameraPermission = (options = {}) => {
    // Check if we should respect saved permission
    if (!options.forceShow && typeof window !== "undefined") {
      const savedStatus = localStorage.getItem(CAMERA_PERMISSION_KEY)

      if (savedStatus === "granted") {
        // If permission is already granted, just call the callback with a small delay
        // to ensure DOM elements are ready
        setTimeout(() => {
          options.onPermissionGranted?.()
        }, 100)
        return
      } else if (savedStatus === "denied") {
        // If permission is already denied, just call the callback
        options.onPermissionDenied?.()
        return
      }
    }

    // Otherwise show the modal
    setPermissionOptions(options)
    setShowPermissionModal(true)
  }

  const hideCameraPermission = () => {
    setShowPermissionModal(false)
  }

  return (
    <ModalContext.Provider
      value={{
        showCameraPermission,
        hideCameraPermission,
      }}
    >
      {children}

      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <CameraPermission
            onPermissionGranted={() => {
              // Save permission status
              localStorage.setItem(CAMERA_PERMISSION_KEY, "granted")
              permissionOptions.onPermissionGranted?.()
              // Don't auto-close on granted so user can see the success message
            }}
            onPermissionDenied={() => {
              // Save permission status
              localStorage.setItem(CAMERA_PERMISSION_KEY, "denied")
              permissionOptions.onPermissionDenied?.()
              // Don't auto-close on denied so user can see instructions
            }}
            onClose={hideCameraPermission}
            fullScreen={permissionOptions.fullScreen}
          />
        </div>
      )}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return context
}
