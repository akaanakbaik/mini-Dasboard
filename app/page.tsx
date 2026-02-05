"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PinScreen } from "@/components/auth/pin-screen"
import { SetupVps } from "@/components/dashboard/setup-vps"
import { useVpsStore } from "@/store/vps-store"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [isPinValid, setIsPinValid] = React.useState(false)
  const { activeProfile } = useVpsStore()
  const router = useRouter()

  React.useEffect(() => {
    if (activeProfile) {
      router.push("/dashboard")
    }
  }, [activeProfile, router])

  if (activeProfile) return null

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-[#020617] overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen opacity-50" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full mix-blend-screen opacity-50" />

      <AnimatePresence mode="wait">
        {!isPinValid ? (
          <motion.div
            key="pin"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="z-10"
          >
            <PinScreen onSuccess={() => setIsPinValid(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl px-4 z-10"
          >
            <SetupVps />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
