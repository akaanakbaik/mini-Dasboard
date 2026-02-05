"use client"

import * as React from "react"
import { useVpsStore } from "@/hooks/use-vps-store"
import { Badge } from "@/components/ui/badge"
import { maskIpAddress } from "@/lib/security"
import { Wifi, WifiOff, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TopNav() {
  const { config, isConnected } = useVpsStore()

  return (
    <header className="h-16 border-b border-white/5 bg-black/10 backdrop-blur-md flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Server Instance:</h2>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
          <span className="text-xs font-mono font-bold">{config?.name}</span>
          <span className="text-[10px] text-muted-foreground">{maskIpAddress(config?.ip || "")}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={isConnected ? "success" : "destructive"} className="gap-1.5 py-1 px-3">
          {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isConnected ? "STABLE" : "OFFLINE"}
        </Badge>
        
        <div className="h-8 w-[1px] bg-white/10 mx-2" />
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </Button>
        
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-[1px]">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  )
}
