"use client"

import * as React from "react"
import { useSocket } from "@/hooks/use-socket"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Square, RotateCw, Trash2, Cpu, Zap, Activity } from "lucide-react"
import { formatBytes } from "@/lib/utils"

interface Process {
  id: number
  name: string
  status: 'online' | 'stopped' | 'errored'
  cpu: number
  memory: number
  uptime: number
  mode: string
}

export function ProcessManager() {
  const { socket } = useSocket()
  const [processes, setProcesses] = React.useState<Process[]>([])
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!socket) return

    socket.on("pm2:list", (data: Process[]) => {
      setProcesses(data)
      setLoadingAction(null)
    })

    socket.on("pm2:error", () => setLoadingAction(null))

    return () => {
      socket.off("pm2:list")
      socket.off("pm2:error")
    }
  }, [socket])

  const handleAction = (action: string, id: number) => {
    if (!socket) return
    setLoadingAction(`${action}-${id}`)
    socket.emit("pm2:action", { action, id })
  }

  const getStatusColor = (status: string) => {
    if (status === 'online') return 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
    if (status === 'errored')
