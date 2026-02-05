"use client"

import * as React from "react"
import { FileGrid } from "@/components/files/file-grid"
import { useSocket } from "@/hooks/use-socket"
import { useVpsStore } from "@/store/vps-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, FolderPlus, ArrowUp, RefreshCw, Home, Search } from "lucide-react"
import { FileSystemNode } from "@/types"
import { useToast } from "@/components/ui/use-toast"

export default function FileManagerPage() {
  const { socket } = useSocket()
  const { activeProfile } = useVpsStore()
  const { toast } = useToast()
  
  const [currentPath, setCurrentPath] = React.useState("/")
  const [files, setFiles] = React.useState<FileSystemNode[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchFiles = React.useCallback(() => {
    if (!socket) return
    setIsLoading(true)
    socket.emit("fs:list", { path: currentPath })
  }, [socket, currentPath])

  React.useEffect(() => {
    if (!socket) return

    socket.on("fs:data", (data: FileSystemNode[]) => {
      setFiles(data)
      setIsLoading(false)
    })

    socket.on("fs:error", (err: any) => {
      toast({ variant: "destructive", title: "File Error", description: err.message })
      setIsLoading(false)
    })

    // Initial fetch
    fetchFiles()

    return () => {
      socket.off("fs:data")
      socket.off("fs:error")
    }
  }, [socket, fetchFiles, toast])

  const handleNavigate = (path: string) => {
    // Relative logic handled by backend, but we track simple path here
    // For simplicity in this demo, backend expects relative path from root
    // But backend sends full relative path in file object.
    setCurrentPath(path)
  }

  const handleUp = () => {
    if (currentPath === "/" || currentPath === "") return
    const parent = currentPath.split("/").slice(0, -1).join("/") || "/"
    setCurrentPath(parent)
  }

  const handleDelete = (path: string) => {
    if (confirm("Are you sure you want to delete this?")) {
      socket?.emit("fs:delete", { path })
      // Optimistic update or wait for refresh. Let's wait for refresh trigger
      setTimeout(fetchFiles, 500)
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">File Manager</h1>
          <p className="text-muted-foreground text-sm">Explore workspace: {activeProfile?.working_directory}</p>
        </div>
        <div className="flex items-center gap-2">
           <Button className="bg-emerald-600 hover:bg-emerald-700"><UploadCloud className="mr-2 h-4 w-4" /> Upload</Button>
           <Button variant="secondary"><FolderPlus className="mr-2 h-4 w-4" /> New Folder</Button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b border-white/10 bg-white/5">
          <Button variant="ghost" size="icon" onClick={() => setCurrentPath("/")}>
            <Home className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleUp} disabled={currentPath === "/"}>
            <ArrowUp className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
             <Input 
                value={currentPath} 
                readOnly 
                className="bg-black/20 border-white/10 font-mono text-xs h-8 pl-8" 
             />
             <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          </div>

          <Button variant="ghost" size="icon" onClick={fetchFiles} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* File Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gradient-to-b from-black/10 to-transparent">
          <FileGrid 
            files={files} 
            onNavigate={handleNavigate} 
            onDelete={handleDelete}
            isLoading={isLoading} 
          />
        </div>
      </Card>
    </div>
  )
}
