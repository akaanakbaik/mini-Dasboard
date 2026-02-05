import { Server, Socket } from 'socket.io'
import { SSHInstance } from '../services/ssh-instance.js'
import { decryptCredential } from '../lib/security.js'

export class SocketManager {
  private ssh: SSHInstance
  private monitorInterval: NodeJS.Timeout | null = null

  constructor(private io: Server, private socket: Socket) {
    this.ssh = new SSHInstance()
    this.setupListeners()
  }

  private setupListeners() {
    this.socket.on('ssh:connect', async (payload) => {
      try {
        console.log(`Connecting to ${payload.host}...`)
        
        // 1. Decrypt password yang dikirim dari Frontend/DB
        const password = await decryptCredential(payload.encryptedPassword)
        
        // 2. Init SSH Connection
        await this.ssh.connect({
          host: payload.host,
          port: payload.port,
          username: payload.username,
          password: password
        })

        this.socket.emit('ssh:status', { status: 'connected' })
        this.startResourceMonitor()
        this.setupTerminal()

      } catch (error: any) {
        console.error('Connection Error:', error.message)
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
      
      // Setup PTY Shell (xterm compatible)
      client.shell({ term: 'xterm-256color', cols: 80, rows: 24 }, (err, stream) => {
        if (err) return this.socket.emit('term:error', { message: err.message })

        // Backend -> Frontend (Output Terminal)
        stream.on('data', (data: Buffer) => {
          this.socket.emit('term:output', data.toString())
        })

        // Frontend -> Backend (Input Keyboard)
        this.socket.on('term:input', (data: string) => {
          stream.write(data)
        })

        stream.on('close', () => {
          this.socket.emit('term:closed')
        })
      })
    } catch (error) {
      console.log('Terminal setup failed', error)
    }
  }

  private startResourceMonitor() {
    // Polling ringan setiap 2 detik untuk status CPU/RAM
    this.monitorInterval = setInterval(async () => {
      try {
        // Command efisien untuk grab CPU & RAM
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
        // Ignore minor polling errors
      }
    }, 2000)
  }

  private cleanup() {
    if (this.monitorInterval) clearInterval(this.monitorInterval)
    this.ssh.disconnect()
    console.log(`Client Disconnected: ${this.socket.id}`)
  }
}
