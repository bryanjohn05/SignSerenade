import CDNMediaPipeHolisticDetector from "@/components/combined-mediapipe-detector"

export default function LandmarkDetectionPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Combined Hand & Face Landmark Detection</h1>
      <p className="mb-6 text-gray-700">
        This page demonstrates combined hand and face landmark detection using MediaPipe loaded from CDN. The landmarks
        are drawn on a black canvas, matching the Python code's output.
      </p>

      <CDNMediaPipeHolisticDetector />

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">About This Implementation</h2>
        <p>
          This implementation loads MediaPipe directly from CDN and properly combines both hand and face landmark
          detection. It implements the same functionality as your Python code but runs entirely in the browser.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Key Features</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Properly combines hand and face landmark detection</li>
          <li>Uses a coordinated rendering approach</li>
          <li>Includes debugging tools and troubleshooting guide</li>
          <li>Lower detection thresholds for better sensitivity</li>
          <li>Matches the visual output of your Python implementation</li>
        </ol>
      </div>
    </div>
  )
}
