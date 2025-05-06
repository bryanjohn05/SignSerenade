//frontend/components/floating-contact-button.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { X, Settings } from "lucide-react"
// import ContactPulseEffect from "./contact-pulse-effect"
import DetectionDebugger from "./detection_debugger"
import BackendConnectionChecker from "./backend-connection-checker"

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const controls = useAnimation()

  // Track mouse position for hover effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })

      if (buttonRef.current && !isOpen) {
        const rect = buttonRef.current.getBoundingClientRect()
        const buttonCenterX = rect.left + rect.width / 2
        const buttonCenterY = rect.top + rect.height / 2

        const maxDistance = 300
        const distance = Math.sqrt(Math.pow(e.clientX - buttonCenterX, 2) + Math.pow(e.clientY - buttonCenterY, 2))

        if (distance < maxDistance) {
          const pull = 1 - distance / maxDistance
          const moveX = (e.clientX - buttonCenterX) * pull * 0.2
          const moveY = (e.clientY - buttonCenterY) * pull * 0.2

          controls.start({
            x: moveX,
            y: moveY,
            transition: { type: "spring", stiffness: 150, damping: 15 },
          })
        } else {
          controls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 150, damping: 15 } })
        }
      }
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Start the floating animation
    const floatingAnimation = async () => {
      while (true) {
        if (!isOpen) {
          await controls.start({
            y: [0, -10, 0],
            transition: { duration: 2, ease: "easeInOut" },
          })
        }
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    }

    floatingAnimation()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [controls, isOpen])

  const toggleOpen = () => {
    setIsOpen(!isOpen)

    // Reset position when toggling
    if (!isOpen) {
      controls.start({ x: 0, y: 0 })
    }
  }

  // Button variants for animations
  const buttonVariants = {
    closed: {
      rotate: 0,
      scale: 1,
    },
    open: {
      rotate: [0, 90, 180, 270, 360],
      scale: [1, 1.2, 1],
      transition: {
        rotate: { duration: 0.5 },
        scale: { duration: 0.3 },
      },
    },
    hover: {
      scale: 1.1,
      boxShadow: "0 0 20px rgb(167, 199, 231)",
    },
    tap: {
      scale: 0.9,
    },
  }

  return (
    <div className="fixed bottom-10 right-6 z-50">
        {isOpen && (
          <div className="absolute bottom-40 right-1 flex flex-col items-center space-y-4">
            <DetectionDebugger />
            <BackendConnectionChecker/>           
          </div>
        )}

      {/* Main Contact Button */}
      <motion.button
        ref={buttonRef}
        onClick={toggleOpen}
        animate={isOpen ? "open" : "closed"}
        variants={buttonVariants}
        initial="closed"
        whileHover="hover"
        whileTap="tap"
        className="relative bg-gradient-to-r from-blue-400 to-purple-600 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-colors duration-300"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          {isOpen ? <X size={24} /> : <Settings size={24} />}
        </motion.div>
      </motion.button>
    </div>
  )
}
