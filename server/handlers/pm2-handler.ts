import { Socket } from 'socket.io'
import { SSHInstance } from '../services/ssh-instance.js'
import { ProcessCore } from '../services/process-core.js'

export class ProcessHandler {
  private pm2: ProcessCore
  private interval: NodeJS.Timeout | null = null

  constructor(private socket: Socket, private ssh: SSHInstance) {
    this.pm2 = new ProcessCore(ssh)
    this.setup()
  }

  private setup() {
    // Initial Fetch
    this.fetchProcesses()

    // Polling setiap 3 detik untuk status proses
    this.interval = setInterval(() => this.fetchProcesses(), 3000)

    this.socket.on('pm2:action', async ({ action, id }) => {
      try {
        await this.pm2.action(action, id)
        this.socket.emit('toast', { type: 'success', message: `Process ${action} success` })
        await this.fetchProcesses()
      } catch (error: any) {
        this.socket.emit('pm2:error', { message: error.message })
      }
    })

    this.socket.on('disconnect', () => {
      if (this.interval) clearInterval(this.interval)
    })
  }

  private async fetchProcesses() {
    try {
      const list = await this.pm2.list()
      this.socket.emit('pm2:list', list)
    } catch (error) {
      // Silent catch for polling
    }
  }
}
