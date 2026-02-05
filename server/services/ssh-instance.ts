import { Client } from 'ssh2'

export interface SSHConfig {
  host: string
  port: number
  username: string
  password?: string
  readyTimeout?: number
}

export class SSHInstance {
  private client: Client
  private isConnected: boolean = false
  
  constructor() {
    this.client = new Client()
  }

  async connect(config: SSHConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client
        .on('ready', () => {
          this.isConnected = true
          resolve()
        })
        .on('error', (err) => {
          this.isConnected = false
          reject(err)
        })
        .on('close', () => {
          this.isConnected = false
        })
        .connect({
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          readyTimeout: 20000,
          keepaliveInterval: 10000
        })
    })
  }

  getClient(): Client {
    if (!this.isConnected) throw new Error('SSH Not Connected')
    return this.client
  }

  disconnect() {
    if (this.isConnected) {
      this.client.end()
      this.isConnected = false
    }
  }

  // Helper untuk mengeksekusi command sekali jalan (non-interactive)
  async exec(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.exec(command, (err, stream) => {
        if (err) return reject(err)
        let data = ''
        let error = ''
        
        stream
          .on('close', () => resolve(data.trim()))
          .on('data', (chunk: Buffer) => { data += chunk.toString() })
          .stderr.on('data', (chunk: Buffer) => { error += chunk.toString() })
      })
    })
  }
}
