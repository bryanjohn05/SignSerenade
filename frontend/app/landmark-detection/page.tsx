import CDNMediaPipeDetector from "@/components/cdn-mediapipe-detector"

export default function LandmarkDetectionPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Landmark Detection (CDN Version)</h1>
      <p className="mb-6 text-gray-700">
        This page demonstrates hand landmark detection using MediaPipe loaded directly from CDN. The landmarks are drawn
        on a black canvas, matching the Python code's output.
      </p>

      <CDNMediaPipeDetector />

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">About This Implementation</h2>
        <p>
          This implementation loads MediaPipe directly from CDN instead of requiring local files in your public
          directory. It implements the same functionality as your Python code but runs entirely in the browser.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">How It Works</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Loads MediaPipe scripts from CDN when you click "Load MediaPipe"</li>
          <li>Initializes the Hands model when you click "Start Camera"</li>
          <li>Processes video frames and draws landmarks on a black canvas</li>
          <li>Matches the visual output of your Python implementation</li>
        </ol>

        <h3 className="text-lg font-semibold mt-4 mb-2">Advantages of CDN Approach</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>No need to download or manage MediaPipe files locally</li>
          <li>Works in any environment with internet access</li>
          <li>Automatically uses the latest version of MediaPipe</li>
          <li>Simpler setup and maintenance</li>
        </ul>
      </div>
    </div>
  )
}
