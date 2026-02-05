"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Terminal, 
  Files, 
  Cpu, 
  Settings, 
  Shield, 
  Zap
} from "lucide-react"

const navItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Terminal", icon: Terminal, href: "/dashboard/terminal" },
  { name: "File Manager", icon: Files, href: "/dashboard/files" },
  { name: "Process Manager", icon: Zap, href: "/dashboard/processes" },
  { name: "System Status", icon: Cpu, href: "/dashboard/stats" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-card/30 backdrop-blur-xl hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mr-3">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <span className="font-bold text-lg tracking-tight">Furinla Panel</span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                )}
                <item.icon className={cn(
                  "w-5 h-5 transition-transform group-hover:scale-105",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                <span>{item.name}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="bg-gradient-to-br from-primary/20 to-purple-500/10 rounded-xl p-4 border border-white/5">
          <p className="text-xs font-medium text-primary mb-1">Secure Tunnel</p>
          <p className="text-[10px] text-muted-foreground">End-to-end encrypted connection active.</p>
        </div>
      </div>
    </aside>
  )
}
