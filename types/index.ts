export interface VpsProfile {
  id: string
  created_at: string
  name: string
  ip_address: string
  ssh_port: number
  username: string
  encrypted_password?: string
  working_directory: string
  is_active: boolean
}

export interface SocketAuthPayload {
  profileId: string
  pin: string
}

export interface FileSystemNode {
  name: string
  path: string
  size: number
  type: 'file' | 'directory' | 'symlink'
  permissions: string
  lastModified: number
  extension?: string
}

export interface SystemStats {
  cpu: number
  ram: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  uptime: number
  network: {
    up: number
    down: number
  }
}
