// MediaPipe utility functions for loading and error handling

// Track MediaPipe loading status
let mediapipeLoadStatus: "not_loaded" | "loading" | "loaded" | "failed" = "not_loaded"
let mediapipeLoadError: Error | null = null

// MediaPipe modules
let Hands: any = null
let drawingUtils: any = null
let cameraUtils: any = null

/**
 * Load MediaPipe modules with error handling
 */
export async function loadMediaPipe(): Promise<boolean> {
  // Return cached result if already attempted
  if (mediapipeLoadStatus === "loaded") return true
  if (mediapipeLoadStatus === "failed") return false

  // Set loading status
  mediapipeLoadStatus = "loading"
  mediapipeLoadError = null

  try {
    console.log("Loading MediaPipe modules...")

    // Try to import MediaPipe modules
    const [handsModule, drawingUtilsModule, cameraUtilsModule] = await Promise.all([
      import("@mediapipe/hands").catch((error) => {
        console.error("Failed to load @mediapipe/hands:", error)
        throw new Error(`MediaPipe Hands module failed to load: ${error.message}`)
      }),
      import("@mediapipe/drawing_utils").catch((error) => {
        console.error("Failed to load @mediapipe/drawing_utils:", error)
        throw new Error(`MediaPipe Drawing Utils module failed to load: ${error.message}`)
      }),
      import("@mediapipe/camera_utils").catch((error) => {
        console.error("Failed to load @mediapipe/camera_utils:", error)
        throw new Error(`MediaPipe Camera Utils module failed to load: ${error.message}`)
      }),
    ])

    // Store modules for later use
    Hands = handsModule.Hands
    drawingUtils = {
      drawConnectors: drawingUtilsModule.drawConnectors,
      drawLandmarks: drawingUtilsModule.drawLandmarks,
    }
    cameraUtils = {
      Camera: cameraUtilsModule.Camera,
    }

    // Verify modules loaded correctly
    if (!Hands) throw new Error("MediaPipe Hands class is undefined")
    if (!drawingUtils.drawConnectors) throw new Error("MediaPipe drawConnectors function is undefined")
    if (!drawingUtils.drawLandmarks) throw new Error("MediaPipe drawLandmarks function is undefined")
    if (!cameraUtils.Camera) throw new Error("MediaPipe Camera class is undefined")

    // Test creating a Hands instance
    try {
      const testHands = new Hands({
        locateFile: (file: string) => {
          return `/mediapipe/hands/${file}`
        },
      })

      if (!testHands) throw new Error("Failed to create MediaPipe Hands instance")
    } catch (error) {
      console.error("Error creating MediaPipe Hands instance:", error)
      throw new Error(`Failed to initialize MediaPipe Hands: ${error instanceof Error ? error.message : String(error)}`)
    }

    console.log("MediaPipe modules loaded successfully")
    mediapipeLoadStatus = "loaded"
    return true
  } catch (error) {
    console.error("MediaPipe loading failed:", error)
    mediapipeLoadStatus = "failed"
    mediapipeLoadError = error instanceof Error ? error : new Error(String(error))
    return false
  }
}

/**
 * Get MediaPipe loading status
 */
export function getMediaPipeStatus(): {
  status: "not_loaded" | "loading" | "loaded" | "failed"
  error: Error | null
} {
  return {
    status: mediapipeLoadStatus,
    error: mediapipeLoadError,
  }
}

/**
 * Get MediaPipe modules if loaded
 */
export function getMediaPipeModules(): {
  Hands: any
  drawingUtils: any
  cameraUtils: any
} | null {
  if (mediapipeLoadStatus !== "loaded") return null

  return {
    Hands,
    drawingUtils,
    cameraUtils,
  }
}

/**
 * Check if WebGL is supported
 */
export function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement("canvas")
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")))
  } catch (e) {
    return false
  }
}

/**
 * Check if browser is compatible with MediaPipe
 */
export function checkBrowserCompatibility(): {
  compatible: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check WebGL support
  if (!isWebGLSupported()) {
    issues.push("WebGL is not supported in your browser. MediaPipe requires WebGL.")
  }

  // Check browser
  const userAgent = navigator.userAgent.toLowerCase()
  const isChrome = userAgent.includes("chrome")
  const isFirefox = userAgent.includes("firefox")
  const isEdge = userAgent.includes("edg")
  const isSafari = userAgent.includes("safari") && !userAgent.includes("chrome")

  if (!isChrome && !isFirefox && !isEdge) {
    if (isSafari) {
      issues.push("You are using Safari, which may have limited MediaPipe support. Chrome or Firefox is recommended.")
    } else {
      issues.push("You are using an unsupported browser. Please use Chrome, Firefox, or Edge for best compatibility.")
    }
  }

  // Check if running in a secure context (required for camera access)
  if (window.isSecureContext === false) {
    issues.push("Application is not running in a secure context (HTTPS). Camera access may be restricted.")
  }

  return {
    compatible: issues.length === 0,
    issues,
  }
}
