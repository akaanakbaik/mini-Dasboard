"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useVpsStore } from "@/hooks/use-vps-store"
import { StatsChart } from "@/components/dashboard/stats-chart"
import { Cpu, HardDrive, Activity, Clock } from "lucide-react"

export default function DashboardOverview() {
  const { config } = useVpsStore()

  const quickStats = [
    { label: "CPU Usage", value: "12.4%", icon: Cpu, color: "text-blue-400" },
    { label: "RAM Usage", value: "1.2 GB / 4 GB", icon: Activity, color: "text-emerald-400" },
    { label: "Disk Space", value: "45 / 80 GB", icon: HardDrive, color: "text-amber-400" },
    { label: "Uptime", value: "12d 4h 22m", icon: Clock, color: "text-purple-400" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-white/5 bg-white/[0.02]">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-white/5 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-lg">Realtime Resource Monitor</CardTitle>
          </CardHeader>
          <CardContent>
            <StatsChart />
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-lg">Recent Bot Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 font-mono text-xs">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex gap-3 text-muted-foreground border-b border-white/5 pb-2">
                  <span className="text-primary">[OK]</span>
                  <span>Bot instance #1 started successfully...</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
