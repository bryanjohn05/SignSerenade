"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Info, Users, Languages, BookOpen, Settings, Menu, X, ChevronDown } from "lucide-react"
import Image from "next/image"
import BackendConnectionChecker from "./backend-connection-checker"
import DetectionDebugger from "./detection_debugger"

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  const [showBackendChecker, setShowBackendChecker] = useState(false)
  const [showDetectionDebugger, setShowDetectionDebugger] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".settings-dropdown") && !target.closest(".settings-button")) {
        setShowSettingsDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const links = [
    { href: "/about", label: "About Us", icon: <Info className="w-5 h-5" /> },
    { href: "/team", label: "Meet the Team", icon: <Users className="w-5 h-5" /> },
    { href: "/translate", label: "Translate", icon: <Languages className="w-5 h-5" /> },
    { href: "/learn", label: "Learning Platform", icon: <BookOpen className="w-5 h-5" /> },
  ]

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowSettingsDropdown(!showSettingsDropdown)
  }

  const handleBackendCheckerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowBackendChecker(true)
    setShowSettingsDropdown(false)
  }

  const handleDetectionDebuggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowDetectionDebugger(true)
    setShowSettingsDropdown(false)
  }

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-gray/50 backdrop-blur-md shadow-md" : "bg-gray/80 backdrop-blur-none shadow-none"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 z-10">
              <div className="relative flex items-center">
                <div className="p-2 rounded-full">
                  <Image src="/favicon.ico" alt="SignSerenade Logo" width={24} height={24} className="w-6 h-6" />
                </div>
                <motion.div
                  className={`ml-3 font-bold text-xl ${scrolled ? "text-gray-900" : "text-gray-900"}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  SignSerenade
                </motion.div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 relative
                    ${pathname === link.href ? "text-blue-700 bg-blue-50" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <span className="flex items-center gap-2">
                    {link.icon}
                    {link.label}
                  </span>
                  {pathname === link.href && (
                    <motion.div
                      className={`absolute bottom-0 left-0 right-0 h-0.5 ${scrolled ? "bg-blue-600" : "bg-white"}`}
                      layoutId="navbar-underline"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}

              {/* Settings Dropdown */}
              {/* <div className="relative">
                <button
                  onClick={handleSettingsClick}
                  className={`settings-button flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${showSettingsDropdown ? "text-blue-700 bg-blue-50" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Settings
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${showSettingsDropdown ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>

                <AnimatePresence>
                  {showSettingsDropdown && (
                    <motion.div
                      className="settings-dropdown absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                          onClick={handleDetectionDebuggerClick}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Detection Debugger
                        </button>
                        <button
                          onClick={handleBackendCheckerClick}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Backend Connection Checker
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div> */}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center justify-center p-2 rounded-full ${
                  scrolled ? "text-blue-700 hover:bg-blue-50" : "text-blue-900 hover:bg-white/10"
                } transition-colors duration-200`}
                aria-expanded={isOpen}
                aria-label="Toggle menu"
              >
                <span className="sr-only">Open main menu</span>
                <AnimatePresence mode="wait" initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="block h-6 w-6" aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="block h-6 w-6" aria-hidden="true" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-16 right-0 bottom-0 z-40 w-full max-w-xs bg-white shadow-xl md:hidden overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="px-2 pt-4 pb-3 space-y-1 sm:px-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${
                    pathname === link.href ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                  } transition-colors duration-200`}
                >
                  <div className={`p-2 rounded-full mr-3 ${pathname === link.href ? "bg-blue-100" : "bg-gray-100"}`}>
                    {link.icon}
                  </div>
                  {link.label}
                </Link>
              ))}

              {/* Settings in mobile menu */}
              {/* <div className="px-2">
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full mr-3 bg-gray-100">
                      <Settings className="w-5 h-5" />
                    </div>
                    Settings
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSettingsDropdown ? "rotate-180" : ""}`} />
                </div>

                <AnimatePresence>
                  {showSettingsDropdown && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-12 pr-4 py-2 space-y-2">
                        <button
                          onClick={() => setShowDetectionDebugger(true)}
                          className="block w-full text-left py-2 text-sm text-gray-700 hover:text-blue-600"
                        >
                          Detection Debugger
                        </button>
                        <button
                          onClick={handleBackendCheckerClick}
                          className="block w-full text-left py-2 text-sm text-gray-700 hover:text-blue-600"
                        >
                          Backend Connection Checker
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div> */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render the components when needed */}
      {showBackendChecker && <BackendConnectionChecker />}
      {showDetectionDebugger && <DetectionDebugger />}
    </>
  )
}
