import { Server, Socket } from 'socket.io'
import { SSHInstance } from '../services/ssh-instance.js'
import { decryptCredential } from '../lib/security.js'
import { FileSystemHandler } from '../handlers/fs-handler.js'
import { ProcessHandler } from '../handlers/pm2-handler.js'

export class SocketManager {
  private ssh: SSHInstance
  private monitorInterval: NodeJS.Timeout | null = null
  private fsHandler: FileSystemHandler | null = null
  private pm2Handler: ProcessHandler | null = null

  constructor(private io: Server, private socket: Socket) {
    this.ssh = new SSHInstance()
    this.setupListeners()
  }

  private setupListeners() {
    this.socket.on('ssh:connect', async (payload) => {
      try {
        console.log(`\x1b[33m[→] Connection Request: ${payload.username}@${payload.host}\x1b[0m`)
        
        const password = await decryptCredential(payload.encryptedPassword)
        
        await this.ssh.connect({
          host: payload.host,
          port: payload.port,
          username: payload.username,
          password: password
        })

        this.socket.emit('ssh:status', { status: 'connected' })
        
        // Initialize Sub-Handlers (The Core Logic)
        this.fsHandler = new FileSystemHandler(this.socket, this.ssh)
        this.pm2Handler = new ProcessHandler(this.socket, this.ssh)
        
        this.startResourceMonitor()
        this.setupTerminal()
        
        console.log(`\x1b[32m[✓] Session Ready for ${this.socket.id}\x1b[0m`)

      } catch (error: any) {
        console.error('Connection Failed:', error.message)
        this.socket.emit('ssh:error', { message: error.message })
      }
    })

    this.socket.on('disconnect', () => {
      this.cleanup()
    })
  }

  private setupTerminal() {
    try {
      const client = this.ssh.getClient()
      
      client.shell({ term: 'xterm-256color', cols: 80, rows: 24 }, (err, stream) => {
        if (err) return this.socket.emit('term:error', { message: err.message })

        stream.on('data', (data: Buffer) => {
          this.socket.emit('term:output', data.toString())
        })

        this.socket.on('term:input', (data: string) => {
          stream.write(data)
        })

        stream.on('close', () => {
          this.socket.emit('term:closed')
        })
      })
    } catch (error) {
      // Ignored if SSH disconnects early
    }
  }

  private startResourceMonitor() {
    this.monitorInterval = setInterval(async () => {
      try {
        const cmd = `top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}' && free -m | grep Mem | awk '{print $3 " " $2}'`
        const result = await this.ssh.exec(cmd)
        const [cpu, ramRaw] = result.split('\n')
        const [used, total] = ramRaw.split(' ')
        
        this.socket.emit('vps:stats', {
          cpu: parseFloat(cpu) || 0,
          ram: {
            used: parseInt(used),
            total: parseInt(total),
            percentage: Math.round((parseInt(used) / parseInt(total)) * 100)
          }
        })
      } catch (e) {
        // Silent fail for polling
      }
    }, 2000)
  }

  private cleanup() {
    if (this.monitorInterval) clearInterval(this.monitorInterval)
    this.ssh.disconnect()
    console.log(`\x1b[31m[x] Client Disconnected: ${this.socket.id}\x1b[0m`)
  }
}
