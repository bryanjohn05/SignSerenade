"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { getQuizData } from "@/lib/api-client"
import { CheckCircle, XCircle, RefreshCw, Info, AlertTriangle } from "lucide-react"
import { SIGN_ACTIONS } from "@/config/api-config"
import { getSignVideoPath } from "@/lib/video-utils"

export default function QuizPage() {
  const [currentSign, setCurrentSign] = useState("")
  const [videoPath, setVideoPath] = useState("")
  const [quizOptions, setQuizOptions] = useState<string[]>([])
  const [quizInProgress, setQuizInProgress] = useState(true)
  const [message, setMessage] = useState("Choose the correct sign for the word displayed")
  const [loading, setLoading] = useState(true)
  const [videoError, setVideoError] = useState(false)
  const [score, setScore] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Generate a fallback quiz if API fails
  const generateFallbackQuiz = () => {
    try {
      // Get 4 random signs from SIGN_ACTIONS
      const shuffled = [...SIGN_ACTIONS].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, 4)
      const correctIndex = Math.floor(Math.random() * 4)
      const correctSign = selected[correctIndex]
      const videoPath = getSignVideoPath(correctSign)

      if (videoPath) {
        setCurrentSign(correctSign)
        setVideoPath(videoPath)
        setQuizOptions(selected)
        setQuizInProgress(true)
        setMessage("Choose the correct sign for the word displayed")
        setError("Using local quiz data due to API error")
        return true
      }
      return false
    } catch (e) {
      console.error("Error generating fallback quiz:", e)
      return false
    }
  }

  // Load quiz data
  const loadQuizData = async () => {
    setLoading(true)
    setVideoError(false)
    setError(null)

    try {
      const data = await getQuizData()
      if (data.sign && data.videoPath && data.options.length > 0) {
        setCurrentSign(data.sign)
        setVideoPath(data.videoPath)
        setQuizOptions(data.options)
        setQuizInProgress(true)
        setMessage("Choose the correct sign for the word displayed")
      } else {
        throw new Error("Invalid quiz data")
      }
    } catch (error) {
      console.error("Error loading quiz data:", error)
      setMessage("Error loading quiz. Using fallback quiz.")

      // Try to generate a fallback quiz
      if (!generateFallbackQuiz()) {
        setVideoError(true)
        setError("Could not load quiz data. Please try again later.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Load quiz on initial render
  useEffect(() => {
    loadQuizData()
  }, [])

  // Handle video error
  const handleVideoError = () => {
    console.error("Error loading video:", videoPath)
    setVideoError(true)

    // Try to generate a fallback quiz
    if (!generateFallbackQuiz()) {
      setError("Could not load video. Please try again later.")
    }
  }

  // Check the selected answer
  const checkAnswer = (selected: string) => {
    if (selected === currentSign) {
      setMessage("Correct! You got it right!")
      setScore((prev) => prev + 1)
    } else {
      setMessage(`Wrong! The correct answer was "${currentSign}".`)
    }
    setQuizInProgress(false)
  }

  // Move to next lesson
  const nextLesson = () => {
    if (quizInProgress) {
      alert("Please complete the quiz first!")
      return
    }

    loadQuizData()
  }

  return (
    <div className="container mx-auto px-4 py-12 text-center max-w-4xl">
      <motion.h1
        className="text-4xl font-bold mb-8 text-black"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Learn Sign Language
      </motion.h1>

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

      <motion.div
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Sign Language Quiz</h2>
            <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">Score: {score}</div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-black">Loading quiz...</p>
            </div>
          ) : (
            <>
              <div className="video-container mb-8">
                {videoError ? (
                  <div className="mx-auto rounded-lg border-2 border-gray-200 max-w-full w-[450px] aspect-video bg-gray-100 flex flex-col items-center justify-center p-4">
                    <Info className="w-12 h-12 text-yellow-500 mb-2" />
                    <h3 className="text-lg font-bold mb-1">Video Not Available</h3>
                    <p className="text-sm text-gray-500">
                      The sign video could not be loaded. Please try another quiz.
                    </p>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    className="mx-auto rounded-lg border-2 border-gray-200 shadow-md max-w-full w-[450px]"
                    controls
                    autoPlay
                    loop
                    src={videoPath}
                    onError={handleVideoError}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              <div className="quiz-section mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-black">Quiz: What is this sign?</h2>
                <div className="message text-xl mb-6 text-black">
                  {message.includes("Correct") ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-6 h-6" />
                      <span>{message}</span>
                    </div>
                  ) : message.includes("Wrong") ? (
                    <div className="flex items-center justify-center gap-2 text-red-600">
                      <XCircle className="w-6 h-6" />
                      <span>{message}</span>
                    </div>
                  ) : (
                    message
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {quizOptions.map((option, index) => (
                    <motion.button
                      key={index}
                      className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                        !quizInProgress && option === currentSign
                          ? "bg-green-500 text-white"
                          : "bg-[#c7d7f5] text-black hover:bg-[#4a628a] hover:text-white"
                      }`}
                      onClick={() => checkAnswer(option)}
                      whileHover={{ scale: quizInProgress ? 1.05 : 1 }}
                      whileTap={{ scale: quizInProgress ? 0.95 : 1 }}
                      disabled={!quizInProgress}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                className={`flex items-center justify-center gap-2 py-3 px-6 mx-auto rounded-lg font-medium ${
                  quizInProgress
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                }`}
                onClick={nextLesson}
                whileHover={!quizInProgress ? { scale: 1.05 } : {}}
                whileTap={!quizInProgress ? { scale: 0.95 } : {}}
                disabled={quizInProgress}
              >
                <RefreshCw className="w-5 h-5" />
                Next Question
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
