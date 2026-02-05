"use client"

import * as React from "react"
import { ProcessManager } from "@/components/dashboard/process-manager"
import { Zap } from "lucide-react"

export default function ProcessesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Process Manager</h1>
          <p className="text-muted-foreground text-sm">Control your bot instances via PM2.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-accent/20 px-3 py-1 rounded-full">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>Auto-refreshing every 3s</span>
        </div>
      </div>
      <ProcessManager />
    </div>
  )
}
