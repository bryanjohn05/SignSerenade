"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, ArrowRight, Sparkles, Info, AlertTriangle } from "lucide-react"
import { translateText } from "@/lib/api-client"
import YoloSignDetector from "@/components/yolo-sign-detector"

export default function TranslatePage() {
  const [inputText, setInputText] = useState("")
  const [translatedVideos, setTranslatedVideos] = useState<string[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isTranslating, setIsTranslating] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Handle text to sign translation
  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputText.trim()) return

    setIsTranslating(true)
    setVideoError(false)
    setError(null)

    try {
      const videos = await translateText(inputText.trim())

      if (videos.length > 0) {
        setTranslatedVideos(videos)
        setCurrentVideoIndex(0)
      } else {
        setVideoError(true)
        setError("No sign videos were found for your text. Try using simpler words or check spelling.")
      }
    } catch (error) {
      console.error("Error translating text:", error)
      setVideoError(true)
      setError("An error occurred while translating. Please try again.")
    } finally {
      setIsTranslating(false)
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
    setError("Could not load the video. The file may be missing or corrupted.")
  }

  // Update video source when currentVideoIndex changes
  useEffect(() => {
    if (translatedVideos.length > 0 && videoRef.current) {
      videoRef.current.src = translatedVideos[currentVideoIndex]
      videoRef.current.load()
      videoRef.current.play().catch((err) => console.error("Error playing video:", err))
    }
  }, [currentVideoIndex, translatedVideos])

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1
        className="text-4xl font-bold mb-2 text-black text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Sign Language Translator
      </motion.h1>

      <motion.p
        className="text-gray-600 text-center mb-12 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Translate between sign language and text using our advanced YOLOv3 model for real-time sign detection
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Section: Sign Language to Text with YOLO */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 text-blue-200 mr-2" />
              <h2 className="text-xl font-bold text-white">Sign Language to Text</h2>
            </div>
            <span className="bg-blue-500/30 text-blue-100 text-xs font-medium px-2.5 py-0.5 rounded-full">
              YOLOv3 Powered
            </span>
          </div>

          <div className="p-6">
            <YoloSignDetector />
          </div>
        </motion.div>

        {/* Right Section: Text to Sign Language */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Text to Sign Language</h2>
          </div>

          <div className="p-6">
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

            <form onSubmit={handleTranslate} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter text to translate to sign language..."
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  required
                  disabled={isTranslating}
                />
                <motion.button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isTranslating || !inputText.trim()}
                >
                  {isTranslating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </form>

            <div className="flex flex-col items-center">
              {translatedVideos.length > 0 ? (
                <motion.div className="w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg mb-3">
                    {videoError ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
                        <Info className="w-12 h-12 text-yellow-500 mb-2" />
                        <h3 className="text-lg font-bold mb-1">Video Not Available</h3>
                        <p className="text-sm text-gray-300">
                          No sign videos were found for "{inputText}". Try using simpler words or check spelling.
                        </p>
                      </div>
                    ) : (
                      <video
                        ref={videoRef}
                        className="w-full h-full object-contain"
                        autoPlay
                        onEnded={handleVideoEnded}
                        onError={handleVideoError}
                        controls
                      >
                        <source src={translatedVideos[currentVideoIndex]} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Sign {currentVideoIndex + 1} of {translatedVideos.length}
                    </span>

                    <div className="flex items-center gap-1">
                      <ArrowRight className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-600">
                        {currentVideoIndex < translatedVideos.length - 1
                          ? "Next sign will play automatically"
                          : "Completed"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-gray-100 rounded-xl p-8 w-full text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                    <Send className="w-6 h-6 text-purple-500" />
                  </div>
                  <p className="text-gray-500">Enter text above to see sign language translations</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
