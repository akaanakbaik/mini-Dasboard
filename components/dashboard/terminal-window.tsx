"use client"

import * as React from "react"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { WebLinksAddon } from "xterm-addon-web-links"
import "xterm/css/xterm.css"
import { useSocket } from "@/hooks/use-socket"
import { Card } from "@/components/ui/card"
import { Maximize2, RotateCw, Terminal as TermIcon, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function TerminalWindow() {
  const terminalRef = React.useRef<HTMLDivElement>(null)
  const xtermRef = React.useRef<Terminal | null>(null)
  const fitAddonRef = React.useRef<FitAddon | null>(null)
  const { socket, isConnected } = useSocket()
  const { toast } = useToast()

  React.useEffect(() => {
    if (!terminalRef.current) return

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"JetBrains Mono", monospace',
      theme: {
        background: "#09090b", 
        foreground: "#fafafa",
        cursor: "#3b82f6",
        selectionBackground: "rgba(59, 130, 246, 0.3)",
        black: "#000000",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#eab308",
        blue: "#3b82f6",
        magenta: "#d946ef",
        cyan: "#06b6d4",
        white: "#ffffff"
      },
      allowProposedApi: true,
      convertEol: true,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    
    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)
    
    term.open(terminalRef.current)
    fitAddon.fit()
    
    xtermRef.current = term
    fitAddonRef.current = fitAddon

    term.writeln("\x1b[1;34m[*] \x1b[37mInitializing Secure Shell Stream...")
    
    if (!isConnected) {
       term.writeln("\x1b[1;33m[!] \x1b[37mConnecting to Socket Gateway...")
    }

    term.onData((data) => {
      if (socket && socket.connected) {
        socket.emit("term:input", data)
      }
    })

    const handleResize = () => fitAddon.fit()
    window.addEventListener("resize", handleResize)

    return () => {
      term.dispose()
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  React.useEffect(() => {
    if (!socket || !xtermRef.current) return

    const handleOutput = (data: string) => {
      xtermRef.current?.write(data)
    }

    const handleConnect = () => {
       xtermRef.current?.writeln("\r\n\x1b[1;32m[+] \x1b[37mConnected to Remote Host.\r\n")
    }

    const handleDisconnect = () => {
       xtermRef.current?.writeln("\r\n\x1b[1;31m[-] \x1b[37mConnection Lost.\r\n")
    }

    socket.on("term:output", handleOutput)
    socket.on("ssh:status", (data: any) => {
        if(data.status === 'connected') handleConnect()
    })
    socket.on("disconnect", handleDisconnect)

    return () => {
      socket.off("term:output", handleOutput)
      socket.off("ssh:status")
      socket.off("disconnect", handleDisconnect)
    }
  }, [socket])

  const copySelection = () => {
    const selection = xtermRef.current?.getSelection()
    if (selection) {
      navigator.clipboard.writeText(selection)
      toast({ title: "Copied", description: "Selection copied to clipboard" })
    }
  }

  const handleFit = () => {
    fitAddonRef.current?.fit()
  }

  return (
    <Card className="flex flex-col h-[75vh] border-white/10 bg-black shadow-2xl overflow-hidden ring-1 ring-white/5">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <TermIcon className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono font-bold tracking-tight text-muted-foreground">BASH / STREAM</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copySelection} title="Copy Selection">
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFit} title="Refit Terminal">
             <Maximize2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.location.reload()}>
             <RotateCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 p-3 overflow-hidden bg-[#09090b] relative">
         <div ref={terminalRef} className="h-full w-full" />
      </div>
    </Card>
  )
}
