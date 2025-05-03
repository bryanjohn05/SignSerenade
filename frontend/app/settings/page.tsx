"use client"

import { motion } from "framer-motion"
import CameraSettings from "@/components/camera-settings"

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        className="text-4xl font-bold mb-8 text-black text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Settings
      </motion.h1>

      <div className="max-w-3xl mx-auto space-y-8">
        <CameraSettings />
      </div>
    </div>
  )
}
