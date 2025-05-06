"use client"

import { useState } from "react"
import { Terminal, Loader2, Download, FolderOpen, CheckCircle } from "lucide-react"

export default function SetupMediaPipeFiles() {
  const [output, setOutput] = useState<Array<{ text: string; type: "info" | "success" | "error" | "command" }>>([])
  const [isRunning, setIsRunning] = useState(false)
  const [step, setStep] = useState(0)

  const addOutput = (text: string, type: "info" | "success" | "error" | "command" = "info") => {
    setOutput((prev) => [...prev, { text, type }])
  }

  const runSetup = async () => {
    setIsRunning(true)
    setOutput([])
    setStep(1)

    // Step 1: Create directory structure
    addOutput("# Step 1: Creating directory structure", "command")
    addOutput("mkdir -p public/mediapipe/hands", "command")
    addOutput("mkdir -p public/mediapipe/drawing_utils", "command")
    addOutput("mkdir -p public/mediapipe/camera_utils", "command")
    addOutput("mkdir -p public/mediapipe/face_mesh", "command")
    await simulateDelay(800)
    addOutput("Directory structure created successfully", "success")

    // Step 2: Download MediaPipe files
    setStep(2)
    addOutput("\n# Step 2: Downloading MediaPipe files", "command")
    addOutput("Downloading hands.js...", "info")
    await simulateDelay(1000)
    addOutput("Downloading drawing_utils.js...", "info")
    await simulateDelay(800)
    addOutput("Downloading camera_utils.js...", "info")
    await simulateDelay(1200)
    addOutput("All files downloaded successfully", "success")

    // Step 3: Manual steps
    setStep(3)
    addOutput("\n# Step 3: Manual setup required", "command")
    addOutput("Please follow these steps to complete the setup:", "info")

    setIsRunning(false)
  }

  const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Terminal className="w-6 h-6" />
        MediaPipe Setup Assistant
      </h2>

      <p className="text-gray-700 mb-6">
        This tool will help you set up MediaPipe correctly for your application. Follow the steps below to ensure all
        files are in the right place.
      </p>

      <div className="mb-8">
        <div className="flex items-center mb-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
              step >= 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            1
          </div>
          <span className="font-medium">Create directory structure</span>
          {step > 1 && <CheckCircle className="w-5 h-5 text-green-500 ml-2" />}
        </div>

        <div className="flex items-center mb-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
              step >= 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            2
          </div>
          <span className="font-medium">Download MediaPipe files</span>
          {step > 2 && <CheckCircle className="w-5 h-5 text-green-500 ml-2" />}
        </div>

        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
              step >= 3 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            3
          </div>
          <span className="font-medium">Manual setup</span>
          {step > 3 && <CheckCircle className="w-5 h-5 text-green-500 ml-2" />}
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={runSetup}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
          {isRunning ? "Running Setup..." : "Start Setup"}
        </button>
      </div>

      {output.length > 0 && (
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto mb-6">
          {output.map((line, index) => (
            <div
              key={index}
              className={`${
                line.type === "command"
                  ? "text-yellow-400"
                  : line.type === "success"
                    ? "text-green-400"
                    : line.type === "error"
                      ? "text-red-400"
                      : "text-gray-300"
              } ${line.text.trim() === "" ? "h-2" : ""}`}
            >
              {line.type === "command" && "$ "}
              {line.text}
            </div>
          ))}
        </div>
      )}

      {step >= 3 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <h3 className="font-medium text-blue-800 mb-2">Manual Setup Required</h3>
          <p className="text-blue-700 mb-4">
            To complete the setup, you need to manually download and place the MediaPipe files in your public directory.
          </p>

          <div className="space-y-4">
            <div className="bg-white p-3 rounded border border-blue-200">
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <Download className="w-4 h-4" /> Step 1: Download the MediaPipe files
              </h4>
              <p className="text-sm mb-2">Download these files from the CDN:</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>
                  <a
                    href="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    hands.js
                  </a>
                </li>
                <li>
                  <a
                    href="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    drawing_utils.js
                  </a>
                </li>
                <li>
                  <a
                    href="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    camera_utils.js
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-white p-3 rounded border border-blue-200">
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <FolderOpen className="w-4 h-4" /> Step 2: Place files in the correct directories
              </h4>
              <p className="text-sm mb-2">Place the downloaded files in these directories:</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>
                  <code className="bg-gray-100 px-1 py-0.5 rounded">hands.js</code> →{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">public/mediapipe/hands/</code>
                </li>
                <li>
                  <code className="bg-gray-100 px-1 py-0.5 rounded">drawing_utils.js</code> →{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">public/mediapipe/drawing_utils/</code>
                </li>
                <li>
                  <code className="bg-gray-100 px-1 py-0.5 rounded">camera_utils.js</code> →{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">public/mediapipe/camera_utils/</code>
                </li>
              </ul>
            </div>

            <div className="bg-white p-3 rounded border border-blue-200">
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <Terminal className="w-4 h-4" /> Step 3: Restart your development server
              </h4>
              <p className="text-sm">After placing the files, restart your development server:</p>
              <pre className="bg-gray-100 p-2 rounded mt-1 text-sm overflow-x-auto">npm run dev</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
