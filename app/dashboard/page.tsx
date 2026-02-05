"use client"

import * as React from "react"
import { RealtimeMonitor } from "@/components/dashboard/realtime-monitor"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Terminal, FolderOpen, PlayCircle, Settings, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useVpsStore } from "@/store/vps-store"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const { activeProfile } = useVpsStore()

  const quickActions = [
    { label: "Open Terminal", icon: Terminal, href: "/dashboard/terminal", color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "File Manager", icon: FolderOpen, href: "/dashboard/files", color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Start Bot", icon: PlayCircle, href: "/dashboard/processes", color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings", color: "text-purple-400", bg: "bg-purple-400/10" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Control panel for <span className="font-mono text-primary">{activeProfile?.working_directory}</span> on <span className="font-mono text-primary">{activeProfile?.ip_address}</span>
        </p>
      </div>

      <RealtimeMonitor />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={action.href}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer border-white/5 bg-white/5 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {action.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${action.bg}`}>
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 group">
                    Access feature <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-white/5 bg-black/20">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>System logs and audit trails.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">SSH Connection Established</p>
                    <p className="text-xs text-muted-foreground">
                      User authenticated via secure tunnel at {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-emerald-500">Success</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader>
            <CardTitle>Bot Health</CardTitle>
            <CardDescription>PM2 Process Status</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[200px]">
             <div className="text-center">
               <div className="w-3 h-3 bg-emerald-500 rounded-full mx-auto mb-2 shadow-[0_0_10px_#10b981]" />
               <p className="text-lg font-bold">System Healthy</p>
               <p className="text-xs text-muted-foreground">No critical errors detected</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
