"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PinScreen } from "@/components/auth/pin-screen"
import { SetupVps } from "@/components/dashboard/setup-vps"
import { useVpsStore } from "@/hooks/use-vps-store"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const { config } = useVpsStore()
  const router = useRouter()

  React.useEffect(() => {
    if (isAuthenticated && config) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, config, router])

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-[#020617] overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="pin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <PinScreen onSuccess={() => setIsAuthenticated(true)} />
          </motion.div>
        ) : !config ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-2xl px-4"
          >
            <SetupVps />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  )
}
