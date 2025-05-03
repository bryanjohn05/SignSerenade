"use client"

import { useState, useRef, type FormEvent } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Send, CheckSquare, Play, AlertTriangle } from "lucide-react"
import { translateText } from "@/lib/api-client"

export default function LearnPage() {
  const [inputText, setInputText] = useState("")
  const [translatedVideos, setTranslatedVideos] = useState<string[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Handle text to sign translation
  const handleTranslate = async (e: FormEvent) => {
    e.preventDefault()

    if (!inputText.trim()) return

    setLoading(true)
    setError(null)
    setVideoError(false)

    try {
      const videos = await translateText(inputText.trim())

      if (videos.length > 0) {
        setTranslatedVideos(videos)
        setCurrentVideoIndex(0)
      } else {
        setError(`No sign videos found for "${inputText}". Try using simpler words or check spelling.`)
      }
    } catch (error) {
      console.error("Error translating text:", error)
      setError("Failed to translate text. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle video ended event
  const handleVideoEnded = () => {
    if (currentVideoIndex < translatedVideos.length - 1) {
      setCurrentVideoIndex((prev) => prev + 1)
    }
  }

  // Handle video error
  const handleVideoError = () => {
    console.error("Error loading video:", translatedVideos[currentVideoIndex])
    setVideoError(true)
    setError(`Could not load video for "${inputText}". The file may be missing or corrupted.`)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.h1
        className="text-4xl font-bold mb-8 text-black text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Learn Sign Language
      </motion.h1>

      <motion.div
        className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <form onSubmit={handleTranslate} className="flex flex-col items-center mb-6">
          <div className="flex w-full max-w-md">
            <input
              type="text"
              placeholder="Enter text to translate"
              className="flex-1 px-4 py-2 rounded-l-lg border-0 focus:ring-2 focus:ring-[#4a628a]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              required
              disabled={loading}
            />
            <motion.button
              type="submit"
              className="bg-[#c7d7f5] text-black px-4 py-2 rounded-r-lg hover:bg-[#4a628a] hover:text-white transition-colors disabled:opacity-50"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </form>

        {error && (
          <motion.div
            className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
              <p className="text-yellow-700">{error}</p>
            </div>
          </motion.div>
        )}

        <hr className="border-gray-600 my-6" />

        <div className="flex flex-col items-center">
          {translatedVideos.length > 0 && !videoError ? (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-black">Translated Sign Videos</h2>
              <div className="w-full max-w-md">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg border-2 border-gray-800"
                  autoPlay
                  onEnded={handleVideoEnded}
                  onError={handleVideoError}
                  src={translatedVideos[currentVideoIndex]}
                  controls
                >
                  Your browser does not support the video tag.
                </video>
                <div className="mt-2 text-sm text-gray-300">
                  Playing {currentVideoIndex + 1} of {translatedVideos.length}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 italic py-8">
              Enter text above to see sign language translations
            </div>
          )}
        </div>

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/quiz" className="btn-primary">
            <Play className="w-5 h-5" />
            Take a Quiz
          </Link>
          <Link href="/validate" className="btn-primary">
            <CheckSquare className="w-5 h-5" />
            Validate
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
