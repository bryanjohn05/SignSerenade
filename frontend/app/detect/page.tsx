"use client"

import { motion } from "framer-motion"
import SignDetector from "@/components/sign-detector"

export default function DetectPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        className="text-4xl font-bold mb-8 text-black text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Sign Language Detection
      </motion.h1>

      <motion.div
        className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-black">YOLO Model Detection</h2>
          <p className="text-gray-300">
            This page demonstrates real-time sign language detection using your YOLO model. The model will identify and
            classify signs with bounding boxes and confidence scores.
          </p>
        </div>

        <SignDetector />
      </motion.div>
    </div>
  )
}
