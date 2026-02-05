"use client"

import * as React from "react"
import { useVpsStore } from "@/store/vps-store"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNav } from "@/components/dashboard/top-nav"
import { motion } from "framer-motion"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { activeProfile } = useVpsStore()
  const router = useRouter()

  React.useEffect(() => {
    if (!activeProfile) {
      router.replace("/")
    }
  }, [activeProfile, router])

  if (!activeProfile) return null

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopNav />
        <motion.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
