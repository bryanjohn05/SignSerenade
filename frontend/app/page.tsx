"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Languages, BookOpen, Target, ArrowRight, Play, Pause } from 'lucide-react'
import { useEffect, useRef, useState } from "react"

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(true)
  const [scrollY, setScrollY] = useState(0)

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle video playback
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Video autoplay failed:", error)
        setIsVideoPlaying(false)
      })
    }
  }, [])

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.6, 0.05, -0.01, 0.9],
      },
    }),
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  return (
    <div className="flex flex-col items-center overflow-hidden">
      {/* Hero Section with Video Background */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          ref={videoRef}
          className="absolute w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="/signs/Hello.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Video Controls */}
        <button
          onClick={toggleVideo}
          className="absolute bottom-8 right-8 z-20 bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 transition-all duration-300"
          aria-label={isVideoPlaying ? "Pause background video" : "Play background video"}
        >
          {isVideoPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
        </button>

        {/* Dark Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              type: "spring",
              stiffness: 100,
            }}
            className="mb-6"
          >
            <motion.span
              className="text-7xl mb-6 block"
              animate={{
                rotateZ: [0, 10, 0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 3,
              }}
            >
              👐
            </motion.span>
            <h1 className="text-5xl md:text-7xl font-bold mb-2 text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                SignSerenade
              </span>
            </h1>
          </motion.div>

          <motion.h3
            className="text-2xl md:text-3xl mb-8 text-gray-200"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your Voice in Signs
          </motion.h3>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              href="/translate"
              className="relative overflow-hidden group px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/30"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-blue-300 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <span className="relative flex items-center justify-center">
                <Languages className="w-5 h-5 mr-2" />
                Translate
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </span>
            </Link>
            <Link
              href="/learn"
              className="relative overflow-hidden group px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/30"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400 to-purple-300 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <span className="relative flex items-center justify-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Learning Platform
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1.5 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Down Indicator */}
        {/* <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: 1,
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2 font-light">Discover More</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div> */}
      </section>

      {/* About Project Section */}
      {/* <section className="w-full py-20 px-4 bg-gradient-to-b from-gray-100 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Our Mission
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-gray-700">
              SignSerenade aims to bridge the communication gap between the deaf community and the hearing world through
              innovative technology. We're committed to making sign language more accessible and promoting inclusivity
              in all forms of communication.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex justify-center mt-8 mb-6">
                <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                    />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-4 text-center text-gray-800">Importance of Sign Language</h3>
                <p className="text-gray-700">
                  Sign language is a vital form of communication for millions of people worldwide. It's not just a tool
                  for the deaf community, but a rich, complex language with its own grammar and syntax. Learning sign
                  language promotes inclusivity and breaks down barriers.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex justify-center mt-8 mb-6">
                <div className="p-4 rounded-full bg-gradient-to-br from-purple-100 to-purple-200">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-4 text-center text-gray-800">Project Goals</h3>
                <p className="text-gray-700">
                  Our project aims to create an accessible platform for sign language translation and learning. We're
                  leveraging cutting-edge AI technology to recognize hand gestures and facial expressions in real-time,
                  making communication seamless between sign language users and non-users.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex justify-center mt-8 mb-6">
                <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-200">
                  <svg
                    className="w-8 h-8 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-4 text-center text-gray-800">Our Technology</h3>
                <p className="text-gray-700">
                  We use MediaPipe for hand and face landmark detection, combined with machine learning models to
                  interpret sign language gestures. Our platform offers real-time translation, interactive learning
                  modules, and validation tools to help users perfect their signing skills.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* American Sign Language Section */}
      <section className="w-full py-20 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              American Sign Language
            </h2>
            <p className="text-lg max-w-3xl mx-auto text-gray-700">
              American Sign Language (ASL) is a complete, natural language that has the same linguistic properties as
              spoken languages, with grammar that differs from English.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">The Rich History of ASL</h3>
              <p className="text-gray-700 mb-6">
                ASL originated in the early 19th century at the American School for the Deaf (ASD), founded in 1817. It
                evolved from a combination of French Sign Language, various local sign languages, and home signs.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-gray-800">ASL: A Complete Language</h3>
              <p className="text-gray-700 mb-6">
                ASL is a visual language that incorporates gestures, facial expressions, head movements, and body
                language. It has its own grammar, syntax, and rules that differ from English, making it a unique and
                complete language.
              </p>

              <div className="space-y-4">
                <div
                  className="flex items-center"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <p className="text-gray-800">
                    <strong>Visual-Spatial Language:</strong> Uses space, movement, and non-manual markers
                  </p>
                </div>

                <div
                  className="flex items-center"
                >
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-bold">2</span>
                  </div>
                  <p className="text-gray-800">
                    <strong>Unique Grammar:</strong> Different word order and structure from English
                  </p>
                </div>

                <div
                  className="flex items-center"
                >
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <span className="text-indigo-600 font-bold">3</span>
                  </div>
                  <p className="text-gray-800">
                    <strong>Regional Variations:</strong> Like spoken languages, ASL has dialects and accents
                  </p>
                </div>

                <div
                  className="flex items-center"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">4</span>
                  </div>
                  <p className="text-gray-800">
                    <strong>Cultural Component:</strong> Deeply connected to Deaf culture and community
                  </p>
                </div>
              </div>
            </div>

            <div
              className="relative"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl opacity-80"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ASL Alphabet Section */}
      <section className="w-full px-4 md:px-20 py-20 bg-white">
        <div className="relative p-8 bg-white bg-opacity-90 rounded-2xl shadow-xl border border-gray-100">
          <h3 className="text-4xl font-semibold mb-6 text-center text-gray-800">ASL Alphabet</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((letter, index) => (
              <div
                key={letter}
                className="aspect-square flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm border border-gray-100 hover:scale-105 transition-transform"
                onClick={() => {
                  const video = document.getElementById(`video-${letter}`) as HTMLVideoElement;
                  if (video) {
                    video.play();
                  }
                }}
              >
                <div className="relative w-full h-full">
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-purple-600">
                    {letter}
                  </span>
                  <video
                    id={`video-${letter}`}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                    src={`/signs/${letter}.mp4`}
                    muted
                    loop
                    onMouseEnter={(e) => {
                      const video = e.currentTarget as HTMLVideoElement;
                      video.play();
                    }}
                    onMouseLeave={(e) => {
                      const video = e.currentTarget as HTMLVideoElement;
                      video.pause();
                      video.currentTime = 0;
                    }}
                    onTouchEnd={(e) => {
                      const video = e.currentTarget as HTMLVideoElement;
                      video.play();
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/learn"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>Learn ASL with our interactive lessons</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive ASL Demo Section */}
      {/* <section className="w-full py-20 px-4 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Experience ASL Translation</h2>
              <p className="text-lg mb-8 text-gray-200">
                Our platform uses advanced AI to recognize and translate sign language in real-time. Try our interactive
                tools to see how it works.
              </p>

              <div className="space-y-6">
                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center mr-4 shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Real-time Detection</h3>
                    <p className="text-gray-300">
                      Our system detects hand shapes, movements, and facial expressions in real-time using advanced
                      computer vision.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center mr-4 shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Accurate Translation</h3>
                    <p className="text-gray-300">
                      Our AI model translates detected signs into text with high accuracy, even recognizing context and
                      grammar.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center mr-4 shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Learning Resources</h3>
                    <p className="text-gray-300">
                      Access comprehensive tutorials and practice exercises to learn ASL at your own pace.
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="mt-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
              >
                <Link
                  href="/translate"
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-blue-500/30 inline-flex items-center"
                >
                  Try ASL Translation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-gray-700 shadow-xl">
                <div className="aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src="/placeholder.svg?height=720&width=1280"
                    alt="ASL Translation Demo"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Play className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium">ASL Detection</h4>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Live Demo</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Hand Detection</span>
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          initial={{ width: "0%" }}
                          whileInView={{ width: "85%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                          viewport={{ once: true }}
                        ></motion.div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Face Detection</span>
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          initial={{ width: "0%" }}
                          whileInView={{ width: "92%" }}
                          transition={{ duration: 1, delay: 0.7 }}
                          viewport={{ once: true }}
                        ></motion.div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Translation</span>
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          initial={{ width: "0%" }}
                          whileInView={{ width: "78%" }}
                          transition={{ duration: 1, delay: 0.9 }}
                          viewport={{ once: true }}
                        ></motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* Call to Action */}
      <section className="w-full py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience SignSerenade?
          </h2>

          <p className="text-lg mb-8 text-gray-100">
            Start translating sign language or begin your learning journey today.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link
              href="/translate"
              className="group px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center shadow-lg shadow-blue-700/30"
            >
              <Languages className="w-5 h-5 mr-2" />
              <span>Start Translating</span>
              <motion.span
                className="ml-2 opacity-0 group-hover:opacity-100"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>
            <Link
              href="/learn"
              className="group px-8 py-3 bg-transparent border-2 border-white rounded-lg font-medium hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              <span>Begin Learning</span>
              <motion.span
                className="ml-2 opacity-0 group-hover:opacity-100"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>
          </div>
        </div>
      </section>

      {/* Add custom styles for animations */}
      <style jsx>{`
        .gradient-text {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          background-image: linear-gradient(to right, #3b82f6, #8b5cf6);
        }
        
        .modern-card {
          transition: all 0.3s ease;
        }
        
        .modern-card:hover {
          transform: translateY(-5px);
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>


      <footer className="text-center p-2 italic bg-black/90 text-sm text-white bottom-0 w-full">
        <p>&copy; {new Date().getFullYear()} SignSerenade:Your Voice in Signs </p>
      </footer>
    </div>
  )
}
