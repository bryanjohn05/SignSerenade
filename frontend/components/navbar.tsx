"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Info, Users, Languages, BookOpen, Scan, Fingerprint, Camera } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Home", icon: <Home className="w-4 h-4 mr-2" /> },
    { href: "/about", label: "About Us", icon: <Info className="w-4 h-4 mr-2" /> },
    { href: "/team", label: "Meet the Team", icon: <Users className="w-4 h-4 mr-2" /> },
    { href: "/translate", label: "Translate", icon: <Languages className="w-4 h-4 mr-2" /> },
    { href: "/learn", label: "Learning Platform", icon: <BookOpen className="w-4 h-4 mr-2" /> },
    { href: "/landmark-detection", label: "Landmark Detection", icon: <Fingerprint className="w-4 h-4 mr-2" /> },
  { href: "/real-time", label: "Real-Time", icon: <Camera className="w-4 h-4 mr-2" /> },
    // { href: "/settings", label: "Settings", icon: <Settings className="w-4 h-4 mr-2" /> },
  ]

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 shadow-md"
      style={{ background: "linear-gradient(to right, #4a628a, #223454)" }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center items-center px-4 py-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-4 py-2 mx-1 rounded-md transition-colors duration-200
              ${pathname === link.href ? "bg-[#4a628a] text-white" : "text-black hover:bg-[#4a628a] hover:text-white"}`}
          >
            {link.icon}
            <span>{link.label}</span>
            {pathname === link.href && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                layoutId="navbar-underline"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        ))}
      </div>
    </motion.nav>
  )
}
