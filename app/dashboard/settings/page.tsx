"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSocket } from "@/hooks/use-socket"
import { Terminal, Package, Save, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { socket } = useSocket(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001")
  const { toast } = useToast()
  const [installing, setInstalling] = React.useState<string | null>(null)

  const handleInstall = (runtime: string) => {
    if (!socket) return
    setInstalling(runtime)
    
    const cmd = runtime === 'node' 
      ? 'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs'
      : 'sudo apt-get update && sudo apt-get install -y python3 python3-pip'

    socket.emit('terminal:input', `${cmd}\r`)
    
    toast({
      title: "Installation Started",
      description: `Check the Terminal tab to see ${runtime} installation progress.`,
    })

    setTimeout(() => setInstalling(null), 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-muted-foreground text-sm">Configure runtime environments and system preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="text-primary" /> Runtime Installer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#339933]/20 rounded-lg">
                    <span className="font-bold text-[#339933]">Node.js</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Node.js Environment</h4>
                    <p className="text-xs text-muted-foreground">Install Latest LTS (v20.x)</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleInstall('node')} 
                  disabled={!!installing}
                  variant="outline"
                >
                  {installing === 'node' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Install / Update"}
                </Button>
             </div>

             <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#3776AB]/20 rounded-lg">
                    <span className="font-bold text-[#3776AB]">Python 3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Python Environment</h4>
                    <p className="text-xs text-muted-foreground">Install Python 3 & PIP</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleInstall('python')} 
                  disabled={!!installing}
                  variant="outline"
                >
                  {installing === 'python' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Install / Update"}
                </Button>
             </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Terminal className="text-purple-400" /> Startup Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground mb-4">
               To configure startup, please edit your <code>package.json</code> or use PM2 ecosystem file via File Manager.
             </p>
             <div className="p-4 bg-black/40 rounded-lg font-mono text-xs text-muted-foreground border border-white/5">
               Current Working Directory: <span className="text-emerald-400">/root/furinla</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
