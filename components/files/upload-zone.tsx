"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, X, File as FileIcon, CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useVpsStore } from "@/hooks/use-vps-store"
import axios from "axios"
import path from "path"

interface UploadZoneProps {
  currentPath: string
  onUploadComplete: () => void
}

export function UploadZone({ currentPath, onUploadComplete }: UploadZoneProps) {
  const [uploadingFiles, setUploadingFiles] = React.useState<{name: string, progress: number}[]>([])
  const { config } = useVpsStore()
  const { toast } = useToast()

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    if (!config) return

    const newUploads = acceptedFiles.map(f => ({ name: f.name, progress: 0 }))
    setUploadingFiles(prev => [...prev, ...newUploads])

    for (const file of acceptedFiles) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', path.posix.join(currentPath, file.name))
      formData.append('host', config.ip)
      formData.append('username', config.username)
      formData.append('password', config.password || '')

      try {
        await axios.post('/api/upload', formData, {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
            setUploadingFiles(prev => 
              prev.map(u => u.name === file.name ? { ...u, progress: percent } : u)
            )
          }
        })
        
        toast({ title: "Upload Success", description: `${file.name} uploaded successfully.` })
      } catch (error) {
        toast({ variant: "destructive", title: "Upload Failed", description: `Failed to upload ${file.name}` })
      }
    }
    
    setUploadingFiles([])
    onUploadComplete()
  }, [currentPath, config, toast, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    noClick: true,
    noKeyboard: true 
  })

  return (
    <div {...getRootProps()} className="relative h-full w-full">
      <input {...getInputProps()} />
      
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-sm border-2 border-dashed border-primary rounded-xl"
          >
            <div className="text-center p-8 bg-black/80 rounded-xl shadow-2xl">
              <UploadCloud className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl font-bold">Drop files to upload</h3>
              <p className="text-muted-foreground">Upload to {currentPath}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-40 space-y-2 w-80 pointer-events-none">
        <AnimatePresence>
          {uploadingFiles.map((file) => (
            <motion.div
              key={file.name}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="bg-card border border-white/10 p-3 rounded-lg shadow-xl pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium truncate">{file.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{file.progress}%</span>
              </div>
              <Progress value={file.progress} className="h-1.5" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
