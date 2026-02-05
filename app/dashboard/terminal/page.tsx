"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { TerminalWindow } from "@/components/dashboard/terminal-window"
import { Badge } from "@/components/ui/badge"
import { Keyboard } from "lucide-react"

export default function TerminalPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Interactive Shell</h1>
          <p className="text-muted-foreground text-sm">Real-time SSH access to your bot environment.</p>
        </div>
        <Badge variant="outline" className="gap-2 px-3 py-1 bg-background/50 backdrop-blur">
          <Keyboard className="w-3.5 h-3.5" />
          <span className="font-mono text-xs">CTRL+C to Interrupt</span>
        </Badge>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1"
      >
        <TerminalWindow />
      </motion.div>
    </div>
  )
}
