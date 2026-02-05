"use client"

import * as React from "react"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { WebLinksAddon } from "xterm-addon-web-links"
import "xterm/css/xterm.css"
import { useSocket } from "@/hooks/use-socket"
import { useVpsStore } from "@/hooks/use-vps-store"
import { Card } from "@/components/ui/card"
import { Maximize2, Terminal as TermIcon, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TerminalWindow() {
  const terminalRef = React.useRef<HTMLDivElement>(null)
  const xtermRef = React.useRef<Terminal | null>(null)
  const { socket } = useSocket(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001")
  const { config } = useVpsStore()

  React.useEffect(() => {
    if (!terminalRef.current) return

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"Fira Code", monospace',
      theme: {
        background: "transparent",
        foreground: "#ffffff",
        cursor: "#3b82f6",
        selectionBackground: "rgba(59, 130, 246, 0.3)",
      },
      allowProposedApi: true,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(new WebLinksAddon())
    
    term.open(terminalRef.current)
    fitAddon.fit()
    xtermRef.current = term

    term.writeln("\x1b[1;34m[*] \x1b[37mConnecting to Furinla Secure Tunnel...")

    if (socket) {
      socket.on("terminal:output", (data: string) => {
        term.write(data)
      })

      term.onData((data) => {
        socket.emit("terminal:input", data)
      })
    }

    const handleResize = () => fitAddon.fit()
    window.addEventListener("resize", handleResize)

    return () => {
      term.dispose()
      window.removeEventListener("resize", handleResize)
    }
  }, [socket])

  return (
    <Card className="flex flex-col h-[600px] border-white/5 bg-black/40 backdrop-blur-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2">
          <TermIcon className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono font-bold tracking-tight">root@{config?.ip}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7"><RefreshCw className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><Maximize2 className="w-3.5 h-3.5" /></Button>
        </div>
      </div>
      <div className="flex-1 p-2 overflow-hidden">
        <div ref={terminalRef} className="h-full w-full" />
      </div>
    </Card>
  )
}
