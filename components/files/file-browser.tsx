"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileEntry } from "@/types/file-system"
import { formatBytes, formatDate } from "@/lib/utils"
import { 
  Folder, 
  FileCode, 
  FileText, 
  FileImage, 
  FileArchive, 
  File, 
  MoreVertical,
  Download,
  Trash2,
  Move
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface FileBrowserProps {
  files: FileEntry[]
  onNavigate: (path: string) => void
  onRefresh: () => void
  isLoading?: boolean
}

const getFileIcon = (entry: FileEntry) => {
  if (entry.type === 'directory') return <Folder className="w-10 h-10 text-blue-500 fill-blue-500/20" />
  
  const ext = entry.extension?.toLowerCase() || ''
  if (['js', 'ts', 'json', 'py', 'php', 'html', 'css'].includes(ext)) return <FileCode className="w-10 h-10 text-yellow-500" />
  if (['jpg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return <FileImage className="w-10 h-10 text-purple-500" />
  if (['zip', 'tar', 'gz', 'rar'].includes(ext)) return <FileArchive className="w-10 h-10 text-red-500" />
  if (['txt', 'md', 'log'].includes(ext)) return <FileText className="w-10 h-10 text-slate-400" />
  
  return <File className="w-10 h-10 text-slate-500" />
}

export function FileBrowser({ files, onNavigate, isLoading }: FileBrowserProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
      <AnimatePresence mode="popLayout">
        {files.map((file, i) => (
          <motion.div
            key={file.path}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => file.type === 'directory' && onNavigate(file.path)}
            className="group relative flex flex-col items-center p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download</DropdownMenuItem>
                  <DropdownMenuItem><Move className="mr-2 h-4 w-4" /> Move</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="mb-3 transition-transform group-hover:scale-110 duration-200">
              {getFileIcon(file)}
            </div>
            
            <span className="text-sm font-medium text-center truncate w-full px-2 select-none">
              {file.name}
            </span>
            
            <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
              {file.type === 'directory' ? (
                <span>Folder</span>
              ) : (
                <span>{formatBytes(file.size)}</span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {files.length === 0 && !isLoading && (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Folder className="w-16 h-16 mb-4 opacity-20" />
          <p>Directory is empty</p>
        </div>
      )}
    </div>
  )
}
