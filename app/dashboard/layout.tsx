"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useVpsStore } from "@/hooks/use-vps-store"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNav } from "@/components/dashboard/top-nav"
import { useSocket } from "@/hooks/use-socket"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { config, isConnected, setConnected } = useVpsStore()
  const router = useRouter()
  const { socket } = useSocket(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001")

  React.useEffect(() => {
    if (!config) {
      router.push("/")
    }
  }, [config, router])

  React.useEffect(() => {
    if (socket && config) {
      socket.emit("ssh:connect", config)
      socket.on("ssh:status", (status: { connected: boolean }) => {
        setConnected(status.connected)
      })
    }
  }, [socket, config, setConnected])

  if (!config) return null

  return (
    <div className="flex h-screen w-full bg-[#020617] text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav />
        <motion.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
