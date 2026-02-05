"use client"

import * as React from "react"
import { FileBrowser } from "@/components/files/file-browser"
import { FileEntry } from "@/types/file-system"
import { useSocket } from "@/hooks/use-socket"
import { useVpsStore } from "@/hooks/use-vps-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, FolderPlus, ArrowUp, RefreshCw, Home } from "lucide-react"

export default function FileManagerPage() {
  const { config } = useVpsStore()
  const { socket } = useSocket(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001")
  
  const [currentPath, setCurrentPath] = React.useState(config?.workingDir || "/root")
  const [files, setFiles] = React.useState<FileEntry[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (socket && config) {
      setIsLoading(true)
      socket.emit("files:list", { path: currentPath })
      
      socket.on("files:list:data", (data: FileEntry[]) => {
        setFiles(data)
        setIsLoading(false)
      })
    }
    return () => {
      socket?.off("files:list:data")
    }
  }, [socket, currentPath, config])

  const handleNavigate = (path: string) => {
    setCurrentPath(path)
  }

  const handleUp = () => {
    const parent = currentPath.split("/").slice(0, -1).join("/") || "/"
    setCurrentPath(parent)
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">File Manager</h1>
          <p className="text-muted-foreground text-sm">Manage your bot files and resources.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button><UploadCloud className="mr-2 h-4 w-4" /> Upload</Button>
           <Button variant="secondary"><FolderPlus className="mr-2 h-4 w-4" /> New Folder</Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col border-white/5 bg-black/20 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-white/5 bg-white/5">
          <Button variant="ghost" size="icon" onClick={() => setCurrentPath(config?.workingDir || "/root")}>
            <Home className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleUp} disabled={currentPath === "/"}>
            <ArrowUp className="w-4 h-4" />
          </Button>
          <div className="flex-1">
             <Input 
                value={currentPath} 
                readOnly 
                className="bg-black/20 border-white/10 font-mono text-sm h-9" 
             />
          </div>
          <Button variant="ghost" size="icon" onClick={() => socket?.emit("files:list", { path: currentPath })}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
          <FileBrowser 
            files={files} 
            onNavigate={handleNavigate} 
            onRefresh={() => {}}
            isLoading={isLoading} 
          />
        </div>
      </Card>
    </div>
  )
}
