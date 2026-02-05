import { Socket } from 'socket.io'
import { SSHInstance } from '../services/ssh-instance.js'
import { FileSystemCore } from '../services/fs-core.js'

export class FileSystemHandler {
  private fs: FileSystemCore | null = null

  constructor(private socket: Socket, private ssh: SSHInstance) {
    this.setup()
  }

  private async getFs() {
    if (!this.fs) {
      // Hardcoded root for security as requested
      this.fs = new FileSystemCore(this.ssh.getClient(), '/root/furinla')
      await this.fs.init()
    }
    return this.fs
  }

  private setup() {
    this.socket.on('fs:list', async ({ path }) => {
      try {
        const fs = await this.getFs()
        const files = await fs.list(path)
        this.socket.emit('fs:data', files)
      } catch (error: any) {
        this.socket.emit('fs:error', { message: error.message })
      }
    })

    this.socket.on('fs:mkdir', async ({ path }) => {
      try {
        const fs = await this.getFs()
        await fs.mkdir(path)
        
        // Auto refresh parent
        const parent = path.split('/').slice(0, -1).join('/') || '/'
        const files = await fs.list(parent)
        this.socket.emit('fs:data', files)
        this.socket.emit('toast', { type: 'success', message: 'Folder created' })
      } catch (error: any) {
        this.socket.emit('fs:error', { message: error.message })
      }
    })

    this.socket.on('fs:delete', async ({ path }) => {
      try {
        const fs = await this.getFs()
        await fs.delete(path)
        
        // Auto refresh parent
        const parent = path.split('/').slice(0, -1).join('/') || '/'
        const files = await fs.list(parent)
        this.socket.emit('fs:data', files)
        this.socket.emit('toast', { type: 'success', message: 'Item deleted' })
      } catch (error: any) {
        this.socket.emit('fs:error', { message: error.message })
      }
    })
  }
}
