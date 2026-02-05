import { Client, SFTPWrapper } from 'ssh2'
import path from 'path'

export class FileSystemCore {
  private sftp: SFTPWrapper | null = null
  private rootDir: string

  constructor(private client: Client, rootDir: string = '/root/furinla') {
    this.rootDir = path.normalize(rootDir)
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.sftp((err, sftp) => {
        if (err) return reject(err)
        this.sftp = sftp
        resolve()
      })
    })
  }

  // Security: Prevent accessing ../../outside_root
  private validatePath(requestedPath: string): string {
    // Resolve absolute path
    const resolvedPath = path.posix.resolve(this.rootDir, requestedPath.replace(/^\/+/, ''))
    
    // Check if resolved path starts with rootDir
    if (!resolvedPath.startsWith(this.rootDir)) {
       throw new Error(`Access Denied: ${resolvedPath} is outside workspace`)
    }
    return resolvedPath
  }

  async list(dirPath: string): Promise<any[]> {
    if (!this.sftp) throw new Error('SFTP not initialized')
    
    const targetPath = this.validatePath(dirPath)

    return new Promise((resolve, reject) => {
      this.sftp!.readdir(targetPath, (err, list) => {
        if (err) return reject(err)

        const files = list.map(item => ({
          name: item.filename,
          path: path.posix.join(dirPath, item.filename), // Send relative path to frontend
          size: item.attrs.size,
          type: item.longname.startsWith('d') ? 'directory' : 'file',
          permissions: item.attrs.mode.toString(8).slice(-3),
          lastModified: item.attrs.mtime * 1000,
          extension: item.longname.startsWith('d') ? undefined : path.extname(item.filename).slice(1)
        }))

        // Sort: Folders first, then files
        files.sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name)
          return a.type === 'directory' ? -1 : 1
        })

        resolve(files)
      })
    })
  }

  async mkdir(dirPath: string): Promise<boolean> {
    if (!this.sftp) throw new Error('SFTP not initialized')
    const targetPath = this.validatePath(dirPath)
    
    return new Promise((resolve, reject) => {
      this.sftp!.mkdir(targetPath, (err) => {
        if (err) return reject(err)
        resolve(true)
      })
    })
  }

  async delete(targetPath: string): Promise<boolean> {
    if (!this.sftp) throw new Error('SFTP not initialized')
    const absPath = this.validatePath(targetPath)
    
    // Check type first (unlink vs rmdir)
    return new Promise((resolve, reject) => {
      this.sftp!.stat(absPath, (err, stats) => {
        if (err) return reject(err)
        
        if (stats.isDirectory()) {
          this.sftp!.rmdir(absPath, (e) => e ? reject(e) : resolve(true))
        } else {
          this.sftp!.unlink(absPath, (e) => e ? reject(e) : resolve(true))
        }
      })
    })
  }
}
