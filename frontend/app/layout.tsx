import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import CameraDebug from "@/components/camera-debug"
import BackendDebug from "@/components/backend-debug"
import BackendConnectionChecker from "@/components/backend-connection-checker"
import { ModalProvider } from "@/context/modal-context"
import DetectionDebugger from "@/components/detection_debugger"
import MediaPipeDiagnostics from "@/components/mediapipe-diagnostics"
import Head from "next/head"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SignSerenade - Sign Language Learning Platform",
  description: "Learn sign language with interactive tools and resources",
  icons: "/favicon.ico",
  openGraph: {
    title: "SignSerenade - Sign Language Learning Platform",
    description: "Learn sign language with interactive tools and resources",
    siteName: "SignSerenade",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossOrigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossOrigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossOrigin="anonymous"></script>
</Head>

      <body className={inter.className}>
        <ModalProvider>
          <Navbar />
          <main className="pt-16">
            {children}
            <CameraDebug />
            <BackendDebug />
            <BackendConnectionChecker />
            <DetectionDebugger />
            <MediaPipeDiagnostics />
          </main>
        </ModalProvider>
      </body>
    </html>
  )
}
