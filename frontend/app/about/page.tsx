"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Languages, BookIcon as BookReader, Brain } from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: <Languages className="w-10 h-10" />,
      title: "Real-Time Translation",
      description: "Convert sign language gestures into spoken and written words, breaking barriers in communication.",
    },
    {
      icon: <BookReader className="w-10 h-10" />,
      title: "Interactive Learning",
      description:
        "A learning platform for sign language that offers tutorials, quizzes, and validation of user-performed actions.",
    },
    {
      icon: <Brain className="w-10 h-10" />,
      title: "Powered by AI",
      description:
        "Utilizing AI to recognize complex hand gestures with precision and efficiency using Mediapipe and YOLO.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1
        className="text-4xl font-bold mb-6 text-black text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        About SignSerenade
      </motion.h1>

      <motion.p
        className="text-lg mb-12 max-w-3xl mx-auto text-gray-700 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        SignSerenade is a revolutionary platform designed to bridge the gap between the hearing and deaf communities. By
        leveraging cutting-edge technology, including Artificial Intelligence and Machine Learning, our platform
        facilitates seamless sign language recognition, translation, and learning.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-black/30 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
          >
            <div className="text-[#4a628a] mb-4 flex justify-center">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-3 text-black">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Link href="/translate" className="btn-primary">
          <Languages className="w-5 h-5" />
          Start Translating Now
        </Link>
      </motion.div>
    </div>
  )
}
