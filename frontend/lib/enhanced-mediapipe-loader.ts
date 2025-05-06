/**
 * Enhanced MediaPipe loader with better error handling and debugging
 */

// Track MediaPipe loading status
let mediapipeLoadStatus: "not_loaded" | "loading" | "loaded" | "failed" = "not_loaded"
let mediapipeLoadError: Error | null = null
let mediapipeDebugInfo: Record<string, any> = {}

// MediaPipe modules
let Hands: any = null
let drawingUtils: any = null
let cameraUtils: any = null

/**
 * Check if a file exists at the given URL
 */
async function checkFileExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" })
    return response.ok
  } catch (error) {
    console.error(`Error checking if file exists at ${url}:`, error)
    return false
  }
}

/**
 * Verify MediaPipe files exist in the public directory
 */
async function verifyMediaPipeFiles(): Promise<{ success: boolean; missingFiles: string[] }> {
  const baseUrl = window.location.origin
  const requiredFiles = [
    "/mediapipe/hands/hands.js",
    "/mediapipe/hands/hands_solution_packed_assets.data",
    "/mediapipe/hands/hands_solution_packed_assets_loader.js",
    "/mediapipe/hands/hands_solution_simd_wasm_bin.js",
    "/mediapipe/hands/hands_solution_simd_wasm_bin.wasm",
    "/mediapipe/hands/wasm_mediapipe_hands.js",
  ]

  const fileChecks = await Promise.all(
    requiredFiles.map(async (file) => {
      const exists = await checkFileExists(`${baseUrl}${file}`)
      return { file, exists }
    }),
  )

  const missingFiles = fileChecks.filter((check) => !check.exists).map((check) => check.file)
  return {
    success: missingFiles.length === 0,
    missingFiles,
  }
}

/**
 * Load a script dynamically
 */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = src
    script.onload = () => resolve()
    script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

/**
 * Load MediaPipe modules with enhanced error handling and debugging
 */
export async function loadMediaPipeEnhanced(
  options: { debug?: boolean; forceReload?: boolean } = {},
): Promise<{ success: boolean; error?: Error; debugInfo?: Record<string, any> }> {
  const { debug = false, forceReload = false } = options

  // Return cached result if already loaded and not forcing reload
  if (mediapipeLoadStatus === "loaded" && !forceReload) {
    return { success: true, debugInfo: mediapipeDebugInfo }
  }

  // If already failed and not forcing reload, return the error
  if (mediapipeLoadStatus === "failed" && !forceReload) {
    return { success: false, error: mediapipeLoadError || new Error("Unknown error"), debugInfo: mediapipeDebugInfo }
  }

  // Reset state if forcing reload
  if (forceReload) {
    mediapipeLoadStatus = "not_loaded"
    mediapipeLoadError = null
    mediapipeDebugInfo = {}
    Hands = null
    drawingUtils = null
    cameraUtils = null
  }

  // Set loading status
  mediapipeLoadStatus = "loading"
  mediapipeLoadError = null
  mediapipeDebugInfo = {}

  try {
    if (debug) console.log("Verifying MediaPipe files...")

    // First, verify that all required files exist
    const fileCheck = await verifyMediaPipeFiles()
    mediapipeDebugInfo.fileCheck = fileCheck

    if (!fileCheck.success) {
      const error = new Error(`Missing MediaPipe files: ${fileCheck.missingFiles.join(", ")}`)
      mediapipeLoadError = error
      mediapipeLoadStatus = "failed"
      return { success: false, error, debugInfo: mediapipeDebugInfo }
    }

    if (debug) console.log("Loading MediaPipe scripts...")

    // Load scripts directly instead of using imports
    try {
      // Load the main hands script
      await loadScript(`${window.location.origin}/mediapipe/hands/hands.js`)
      mediapipeDebugInfo.handsScriptLoaded = true

      // Check if window.Hands exists
      if (typeof (window as any).Hands === "undefined") {
        throw new Error("MediaPipe Hands class not found in global scope after loading script")
      }

      Hands = (window as any).Hands
      mediapipeDebugInfo.handsClassAvailable = !!Hands
    } catch (error) {
      console.error("Failed to load MediaPipe Hands script:", error)
      mediapipeLoadError = error instanceof Error ? error : new Error(String(error))
      mediapipeLoadStatus = "failed"
      mediapipeDebugInfo.handsScriptError = String(error)
      return {
        success: false,
        error: mediapipeLoadError,
        debugInfo: mediapipeDebugInfo,
      }
    }

    // Load drawing utils
    try {
      await loadScript(`${window.location.origin}/mediapipe/drawing_utils/drawing_utils.js`)
      mediapipeDebugInfo.drawingUtilsScriptLoaded = true

      if (
        typeof (window as any).drawConnectors === "undefined" ||
        typeof (window as any).drawLandmarks === "undefined"
      ) {
        throw new Error("MediaPipe drawing utilities not found in global scope after loading script")
      }

      drawingUtils = {
        drawConnectors: (window as any).drawConnectors,
        drawLandmarks: (window as any).drawLandmarks,
      }
    } catch (error) {
      console.error("Failed to load MediaPipe drawing utils script:", error)
      mediapipeLoadError = error instanceof Error ? error : new Error(String(error))
      mediapipeLoadStatus = "failed"
      mediapipeDebugInfo.drawingUtilsScriptError = String(error)
      return {
        success: false,
        error: mediapipeLoadError,
        debugInfo: mediapipeDebugInfo,
      }
    }

    // Load camera utils
    try {
      await loadScript(`${window.location.origin}/mediapipe/camera_utils/camera_utils.js`)
      mediapipeDebugInfo.cameraUtilsScriptLoaded = true

      if (typeof (window as any).Camera === "undefined") {
        throw new Error("MediaPipe Camera class not found in global scope after loading script")
      }

      cameraUtils = {
        Camera: (window as any).Camera,
      }
    } catch (error) {
      console.error("Failed to load MediaPipe camera utils script:", error)
      mediapipeLoadError = error instanceof Error ? error : new Error(String(error))
      mediapipeLoadStatus = "failed"
      mediapipeDebugInfo.cameraUtilsScriptError = String(error)
      return {
        success: false,
        error: mediapipeLoadError,
        debugInfo: mediapipeDebugInfo,
      }
    }

    // Test creating a Hands instance
    try {
      if (debug) console.log("Testing MediaPipe Hands initialization...")

      const testHands = new Hands({
        locateFile: (file: string) => {
          return `/mediapipe/hands/${file}`
        },
      })

      if (!testHands) {
        throw new Error("Failed to create MediaPipe Hands instance")
      }

      mediapipeDebugInfo.handsInstanceCreated = true
    } catch (error) {
      console.error("Error creating MediaPipe Hands instance:", error)
      mediapipeLoadError = error instanceof Error ? error : new Error(String(error))
      mediapipeLoadStatus = "failed"
      mediapipeDebugInfo.handsInstanceError = String(error)
      return {
        success: false,
        error: mediapipeLoadError,
        debugInfo: mediapipeDebugInfo,
      }
    }

    if (debug) console.log("MediaPipe modules loaded successfully")
    mediapipeLoadStatus = "loaded"
    return { success: true, debugInfo: mediapipeDebugInfo }
  } catch (error) {
    console.error("MediaPipe loading failed:", error)
    mediapipeLoadError = error instanceof Error ? error : new Error(String(error))
    mediapipeLoadStatus = "failed"
    mediapipeDebugInfo.generalError = String(error)
    return {
      success: false,
      error: mediapipeLoadError,
      debugInfo: mediapipeDebugInfo,
    }
  }
}

/**
 * Get MediaPipe loading status
 */
export function getMediaPipeStatus(): {
  status: "not_loaded" | "loading" | "loaded" | "failed"
  error: Error | null
  debugInfo: Record<string, any>
} {
  return {
    status: mediapipeLoadStatus,
    error: mediapipeLoadError,
    debugInfo: mediapipeDebugInfo,
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
