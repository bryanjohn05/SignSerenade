"use client"

import { useState } from "react"
import { Terminal, Copy, ExternalLink } from "lucide-react"

export default function SetupMediaPipe() {
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle")

  const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
    setLogs((prev) => [...prev, `[${type.toUpperCase()}] ${message}`])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Copied to clipboard!"))
      .catch((err) => console.error("Failed to copy:", err))
  }

  const setupInstructions = [
    "# Create directories for MediaPipe files",
    "mkdir -p public/mediapipe/hands",
    "",
    "# Install MediaPipe packages",
    "npm install @mediapipe/hands @mediapipe/camera_utils @mediapipe/drawing_utils",
    "",
    "# Copy WASM files to public directory",
    "cp -r node_modules/@mediapipe/hands/* public/mediapipe/hands/",
    "",
    "# Verify files exist",
    "ls -la public/mediapipe/hands/",
  ]

  const manualInstructions = `
1. Install MediaPipe packages:
   npm install @mediapipe/hands @mediapipe/camera_utils @mediapipe/drawing_utils

2. Create directories for MediaPipe files:
   mkdir -p public/mediapipe/hands

3. Copy WASM files to public directory:
   - Find the MediaPipe files in node_modules/@mediapipe/hands/
   - Copy all files to public/mediapipe/hands/

4. Verify the following files exist in public/mediapipe/hands/:
   - hands.js
   - hands_solution_packed_assets.data
   - hands_solution_packed_assets_loader.js
   - hands_solution_simd_wasm_bin.js
   - hands_solution_simd_wasm_bin.wasm
   - wasm_mediapipe_hands.js
  `

  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-black flex items-center gap-2">
        <Terminal className="w-6 h-6" />
        MediaPipe Setup Instructions
      </h2>

      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          Follow these steps to properly set up MediaPipe in your project. This will ensure that all required WASM files
          are available.
        </p>

        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">setup-mediapipe.sh</span>
            <button
              onClick={() => copyToClipboard(setupInstructions.join("\n"))}
              className="text-gray-400 hover:text-white"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {setupInstructions.map((line, index) => (
            <div key={index} className={line.startsWith("#") ? "text-green-400" : ""}>
              {line}
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div>
              <p className="text-yellow-700 font-medium">Manual Setup Instructions</p>
              <pre className="text-yellow-600 text-xs mt-2 whitespace-pre-wrap">{manualInstructions}</pre>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="https://developers.google.com/mediapipe/solutions/vision/hand_landmarker"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            MediaPipe Documentation
          </a>

          <a
            href="https://www.npmjs.com/package/@mediapipe/hands"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            NPM Package
          </a>

          <a
            href="https://github.com/google/mediapipe"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            GitHub Repository
          </a>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">Troubleshooting Tips</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
          <li>Make sure all WASM files are copied to the public directory</li>
          <li>Check browser console for specific MediaPipe loading errors</li>
          <li>Verify that your browser supports WebGL (required for MediaPipe)</li>
          <li>Try using Chrome or Edge for best compatibility</li>
          <li>Ensure you're running the app in a secure context (HTTPS or localhost)</li>
        </ul>
      </div>
    </div>
  )
}
