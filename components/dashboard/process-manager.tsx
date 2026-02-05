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
    if (status === 'errored') return 'bg-red-500 shadow-[0_0_8px_#ef4444]'
    return 'bg-slate-500'
  }

  const formatUptime = (ms: number) => {
    const sec = Math.floor(ms / 1000)
    const min = Math.floor(sec / 60)
    const hr = Math.floor(min / 60)
    const day = Math.floor(hr / 24)
    if (day > 0) return `${day}d`
    if (hr > 0) return `${hr}h`
    if (min > 0) return `${min}m`
    return `${sec}s`
  }

  return (
    <Card className="border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="text-primary" /> Active Processes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {processes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-white/10 rounded-lg">
              <Zap className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No active PM2 processes found.</p>
              <p className="text-xs mt-1">Start a bot via Terminal using 'pm2 start index.js'</p>
            </div>
          ) : (
            processes.map((proc) => (
              <div key={proc.id} className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(proc.status)}`} />
                  <div>
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      {proc.name}
                      <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-muted-foreground font-mono">ID: {proc.id}</span>
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {proc.cpu}%</span>
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {formatBytes(proc.memory)}</span>
                      <span>Up: {formatUptime(proc.uptime)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {proc.status === 'online' ? (
                     <Button 
                        size="sm" variant="outline" 
                        className="h-8 border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                        onClick={() => handleAction('stop', proc.id)}
                        disabled={!!loadingAction}
                     >
                        {loadingAction === `stop-${proc.id}` ? <RotateCw className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4 mr-2" />} Stop
                     </Button>
                  ) : (
                     <Button 
                        size="sm" variant="outline" 
                        className="h-8 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
                        onClick={() => handleAction('start', proc.id)}
                        disabled={!!loadingAction}
                     >
                        {loadingAction === `start-${proc.id}` ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 mr-2" />} Start
                     </Button>
                  )}
                  
                  <Button 
                    size="sm" variant="ghost" 
                    onClick={() => handleAction('restart', proc.id)}
                    disabled={!!loadingAction}
                  >
                    <RotateCw className={`w-4 h-4 ${loadingAction === `restart-${proc.id}` ? 'animate-spin' : ''}`} />
                  </Button>
                  
                  <Button 
                    size="sm" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => handleAction('delete', proc.id)}
                    disabled={!!loadingAction}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
