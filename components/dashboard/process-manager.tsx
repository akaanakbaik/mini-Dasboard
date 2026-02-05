"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Square, RotateCw, Trash2, Cpu, Zap } from "lucide-react"
import { useSocket } from "@/hooks/use-socket"

interface Process {
  pid: number
  name: string
  pm_id: number
  status: 'online' | 'stopped' | 'errored'
  cpu: number
  memory: number
  uptime: string
}

export function ProcessManager() {
  const [processes, setProcesses] = React.useState<Process[]>([])
  const { socket } = useSocket(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001")

  React.useEffect(() => {
    if (socket) {
      socket.emit("pm2:list")
      socket.on("pm2:list:data", (data: Process[]) => setProcesses(data))
      
      const interval = setInterval(() => socket.emit("pm2:list"), 3000)
      return () => {
        clearInterval(interval)
        socket.off("pm2:list:data")
      }
    }
  }, [socket])

  const handleAction = (action: string, id: number) => {
    socket?.emit("pm2:action", { action, id })
  }

  return (
    <Card className="border-white/5 bg-black/20 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="text-yellow-500" /> PM2 Process Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {processes.map((proc) => (
            <div key={proc.pm_id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${proc.status === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`} />
                <div>
                  <h4 className="font-bold text-sm">{proc.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <span className="font-mono">ID: {proc.pm_id}</span>
                    <span>•</span>
                    <span>{proc.uptime}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:block text-right">
                  <div className="text-xs text-muted-foreground">Memory</div>
                  <div className="font-mono text-sm font-bold text-blue-400">{(proc.memory / 1024 / 1024).toFixed(1)} MB</div>
                </div>
                
                <div className="flex items-center gap-1">
                  {proc.status === 'online' ? (
                     <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleAction('stop', proc.pm_id)}><Square className="w-4 h-4" /></Button>
                  ) : (
                     <Button size="icon" variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" onClick={() => handleAction('start', proc.pm_id)}><Play className="w-4 h-4" /></Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => handleAction('restart', proc.pm_id)}><RotateCw className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleAction('delete', proc.pm_id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))}

          {processes.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Cpu className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No PM2 processes running found.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
