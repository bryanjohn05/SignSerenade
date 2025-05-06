"use client"

import { motion } from "framer-motion"
import MediaPipeTest from "@/components/mediapipe-test"
import SetupMediaPipe from "@/scripts/setup-mediapipe"

export default function MediaPipeSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1
        className="text-4xl font-bold mb-2 text-black text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        MediaPipe Settings
      </motion.h1>

      <motion.p
        className="text-center text-gray-600 max-w-2xl mx-auto mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Configure and test MediaPipe hand tracking for sign language detection
      </motion.p>

      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <MediaPipeTest />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SetupMediaPipe />
        </motion.div>
      </div>
    </div>
  )
}
