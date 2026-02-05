"use client"

import { FileSystemNode } from "@/types"
import { formatBytes, formatDate } from "@/lib/utils"
import { 
  Folder, FileCode, FileText, FileImage, FileArchive, File, 
  MoreVertical, Download, Trash2, Move, Copy, HardDrive
} from "lucide-react"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface FileGridProps {
  files: FileSystemNode[]
  onNavigate: (path: string) => void
  onDelete: (path: string) => void
  isLoading?: boolean
}

export function FileGrid({ files, onNavigate, onDelete, isLoading }: FileGridProps) {
  
  const getIcon = (file: FileSystemNode) => {
    if (file.type === 'directory') return <Folder className="w-12 h-12 text-blue-500 fill-blue-500/20" />
    const ext = file.extension?.toLowerCase() || ''
    if (['js', 'ts', 'json', 'env'].includes(ext)) return <FileCode className="w-12 h-12 text-yellow-500" />
    if (['png', 'jpg', 'jpeg', 'svg'].includes(ext)) return <FileImage className="w-12 h-12 text-purple-500" />
    if (['zip', 'tar', 'gz'].includes(ext)) return <FileArchive className="w-12 h-12 text-red-500" />
    return <File className="w-12 h-12 text-slate-500" />
  }

  if (files.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Folder className="w-16 h-16 mb-4 opacity-20" />
        <p>Folder is empty</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {files.map((file, i) => (
        <motion.div
          key={file.path}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.02 }}
          className="group relative flex flex-col items-center p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/10 transition-all hover:scale-105 cursor-pointer"
          onClick={() => file.type === 'directory' && onNavigate(file.path)}
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="w-4 h-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download</DropdownMenuItem>
                <DropdownMenuItem><Copy className="mr-2 h-4 w-4" /> Copy Path</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500" onClick={() => onDelete(file.path)}>
                   <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-3">{getIcon(file)}</div>
          
          <span className="text-sm font-medium text-center truncate w-full px-2" title={file.name}>
            {file.name}
          </span>
          
          <div className="mt-1 flex flex-col items-center gap-0.5 text-[10px] text-muted-foreground">
            <span>{file.type === 'directory' ? 'Folder' : formatBytes(file.size)}</span>
            <span className="opacity-50">{file.permissions}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
