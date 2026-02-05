"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSocket } from "@/hooks/use-socket"
import { Terminal, Package, RefreshCw, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useVpsStore } from "@/store/vps-store"

export default function SettingsPage() {
  const { socket } = useSocket()
  const { activeProfile } = useVpsStore()
  const { toast } = useToast()
  const [installing, setInstalling] = React.useState<string | null>(null)

  const handleInstall = (runtime: string) => {
    if (!socket) return
    setInstalling(runtime)
    
    // Command Injection Logic
    let cmd = ""
    if (runtime === 'node') cmd = 'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs'
    if (runtime === 'python') cmd = 'sudo apt-get update && sudo apt-get install -y python3 python3-pip'
    if (runtime === 'pm2') cmd = 'sudo npm install -g pm2'

    // Send to Terminal Stream
    socket.emit('term:input', `${cmd}\n`)
    
    toast({
      title: "Installation Queued",
      description: `Check the Terminal tab to see ${runtime} installation progress.`,
    })

    setTimeout(() => setInstalling(null), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-muted-foreground text-sm">Configure runtime environments for {activeProfile?.ip_address}</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-white/5 bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="text-primary" /> Runtime Installer
            </CardTitle>
            <CardDescription>One-click install for standard bot environments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {[
               { id: 'node', name: 'Node.js LTS', desc: 'Javascript Runtime (v20.x)', color: 'text-green-500', bg: 'bg-green-500/10' },
               { id: 'python', name: 'Python 3', desc: 'Python Environment & PIP', color: 'text-blue-500', bg: 'bg-blue-500/10' },
               { id: 'pm2', name: 'PM2 Manager', desc: 'Process Manager Daemon', color: 'text-purple-500', bg: 'bg-purple-500/10' }
             ].map((item) => (
               <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${item.bg}`}>
                      <Package className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <h4 className="font-bold">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleInstall(item.id)} 
                    disabled={!!installing}
                    variant="secondary"
                    className="w-32"
                  >
                    {installing === item.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Install"}
                  </Button>
               </div>
             ))}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-black/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="text-primary" /> Startup Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="p-4 bg-black/40 rounded-lg font-mono text-xs text-muted-foreground border border-white/5 flex items-center gap-2">
               <CheckCircle2 className="w-4 h-4 text-emerald-500" />
               Current Working Directory locked to: <span className="text-emerald-400 font-bold">{activeProfile?.working_directory}</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
