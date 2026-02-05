"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Terminal, 
  Files, 
  Cpu, 
  Settings, 
  LogOut, 
  Shield,
  Box
} from "lucide-react"
import { useVpsStore } from "@/hooks/use-vps-store"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Terminal", icon: Terminal, href: "/dashboard/terminal" },
  { name: "File Manager", icon: Files, href: "/dashboard/files" },
  { name: "Processes", icon: Box, href: "/dashboard/processes" },
  { name: "Resources", icon: Cpu, href: "/dashboard/stats" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const logout = useVpsStore((state) => state.logout)

  return (
    <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
          <Shield className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-glow">FURINLA</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 transition-transform group-hover:scale-110",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          <span>Disconnect VPS</span>
        </Button>
      </div>
    </aside>
  )
}
