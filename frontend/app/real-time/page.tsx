"use client"

import { motion } from "framer-motion"
import RealTimeSignDetector from "@/components/real-time-sign-detector"

export default function RealTimePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        className="text-4xl font-bold mb-8 text-black text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Real-Time Sign Detection
      </motion.h1>

      <motion.p
        className="text-center text-gray-600 max-w-2xl mx-auto mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        This page demonstrates real-time sign language detection using your YOLO model. The system captures frames every
        few seconds and identifies signs with high confidence.
      </motion.p>

      <RealTimeSignDetector />
    </div>
  )
}
