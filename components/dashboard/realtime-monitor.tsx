"use client"

import * as React from "react"
import { useSocket } from "@/hooks/use-socket"
import { useVpsStore } from "@/store/vps-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Cpu, HardDrive, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export function RealtimeMonitor() {
  const { socket } = useSocket()
  const { setStats, stats } = useVpsStore()

  React.useEffect(() => {
    if (!socket) return

    const handleStats = (data: any) => {
      setStats(data)
    }

    socket.on("vps:stats", handleStats)
    return () => {
      socket.off("vps:stats", handleStats)
    }
  }, [socket, setStats])

  const getStatusColor = (percent: number) => {
    if (percent > 85) return "bg-red-500"
    if (percent > 60) return "bg-amber-500"
    return "bg-emerald-500"
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.cpu.toFixed(1) || 0}%</div>
          <Progress 
            value={stats?.cpu || 0} 
            className="mt-3 h-2" 
            indicatorClassName={getStatusColor(stats?.cpu || 0)}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Load Average (1m)
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.ram.percentage || 0}%</div>
          <Progress 
            value={stats?.ram.percentage || 0} 
            className="mt-3 h-2"
            indicatorClassName={getStatusColor(stats?.ram.percentage || 0)}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {stats ? `${Math.round(stats.ram.used)}MB / ${Math.round(stats.ram.total)}MB` : "Connecting..."}
          </p>
        </CardContent>
      </Card>
      
      {/* Placeholder for Disk & Network (Next update) */}
    </div>
  )
}
