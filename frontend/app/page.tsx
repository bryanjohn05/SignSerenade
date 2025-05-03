"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Languages, BookOpen } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
      <motion.h1
        className="text-5xl font-bold mb-2 text-black"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="block mb-4">👐</span>
        Welcome to SignSerenade
      </motion.h1>

      <motion.h3
        className="text-2xl mb-12 text-black"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Your Voice in Signs
      </motion.h3>

      <motion.div
        className="flex flex-col sm:flex-row gap-6 mt-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Link href="/translate" className="btn-primary">
          <Languages className="w-5 h-5" />
          Translate
        </Link>
        <Link href="/learn" className="btn-primary">
          <BookOpen className="w-5 h-5" />
          Learning Platform
        </Link>
      </motion.div>
    </div>
  )
}
