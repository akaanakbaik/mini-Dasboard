"use client"

import { useVpsStore } from "@/store/vps-store"
import { Button } from "@/components/ui/button"
import { LogOut, Wifi, WifiOff, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function TopNav() {
  const { activeProfile, isConnected, reset } = useVpsStore()

  return (
    <header className="h-16 border-b bg-background/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Connected to</span>
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono text-sm">{activeProfile?.name}</span>
            <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
              {activeProfile?.ip_address}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Badge 
          variant="outline" 
          className={`gap-1.5 ${isConnected ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/10" : "border-red-500/50 text-red-500 bg-red-500/10"}`}
        >
          {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isConnected ? "ONLINE" : "DISCONNECTED"}
        </Badge>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </Button>

        <div className="h-6 w-[1px] bg-border" />

        <Button 
          variant="destructive" 
          size="sm" 
          className="gap-2"
          onClick={reset}
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </Button>
      </div>
    </header>
  )
}
