export interface FileEntry {
  name: string
  path: string
  size: number
  type: 'file' | 'directory' | 'symlink'
  permissions: string
  lastModified: number
  extension?: string
}

export interface FileSystemState {
  currentPath: string
  entries: FileEntry[]
  isLoading: boolean
  selectedFiles: string[]
  clipboard: {
    action: 'copy' | 'cut' | null
    files: string[]
  }
}

export type SortField = 'name' | 'size' | 'lastModified'
export type SortOrder = 'asc' | 'desc'
