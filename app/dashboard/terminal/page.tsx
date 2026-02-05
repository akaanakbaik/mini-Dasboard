"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { TerminalWindow } from "@/components/dashboard/terminal-window"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"

export default function TerminalPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interactive Terminal</h1>
          <p className="text-muted-foreground text-sm">Direct SSH access to your bot workspace.</p>
        </div>
        <Badge variant="outline" className="gap-2 px-3 py-1">
          <Info className="w-3.5 h-3.5" />
          ESC + Q to quick exit
        </Badge>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1"
      >
        <TerminalWindow />
      </motion.div>
    </div>
  )
}
