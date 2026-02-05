import { createServer } from 'http'
import { Server } from 'socket.io'
import { Client } from 'ssh2'
import { setupTerminalStream } from '../lib/terminal-pty.js'
import { setupFileSocket } from '../services/file-socket.js'
import { setupPm2Socket } from '../services/pm2-service.js'
import { decryptCredential } from '../lib/security.js'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
})

console.log('🚀 Furinla Realtime Server Starting...')

io.on('connection', (socket) => {
  console.log(`Client Connected: ${socket.id}`)
  let sshClient: Client | null = null

  socket.on('ssh:connect', async (config) => {
    if (sshClient) {
      sshClient.end()
    }

    sshClient = new Client()

    sshClient.on('ready', () => {
      console.log(`SSH Ready: ${config.ip}`)
      socket.emit('ssh:status', { connected: true })
      
      if (sshClient) {
        setupTerminalStream(sshClient, socket)
        setupFileSocket(socket, sshClient)
        setupPm2Socket(socket, sshClient)

        // Global Resource Monitor
        const statInterval = setInterval(() => {
          if (!sshClient) return clearInterval(statInterval)
          sshClient.exec("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' && free -m | grep Mem | awk '{print $3/$2 * 100}'", (err, stream) => {
             if (err) return
             let data = ''
             stream.on('data', (c: Buffer) => data += c.toString())
             stream.on('close', () => {
               const [cpu, ram] = data.trim().split('\n')
               socket.emit('vps:stats', { 
                 cpu: parseFloat(cpu) || 0, 
                 ram: parseFloat(ram) || 0 
               })
             })
          })
        }, 2000)

        socket.on('disconnect', () => clearInterval(statInterval))
      }
    })

    sshClient.on('error', (err) => {
      console.error('SSH Error:', err.message)
      socket.emit('ssh:status', { connected: false, error: err.message })
    })

    sshClient.on('close', () => {
      console.log('SSH Closed')
      socket.emit('ssh:status', { connected: false })
    })

    try {
      const password = await decryptCredential(config.password)
      sshClient.connect({
        host: config.ip,
        port: config.port,
        username: config.username,
        password: password,
        readyTimeout: 30000,
        keepaliveInterval: 10000
      })
    } catch (error: any) {
      socket.emit('ssh:status', { connected: false, error: error.message })
    }
  })

  socket.on('disconnect', () => {
    if (sshClient) sshClient.end()
    console.log(`Client Disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`✅ Socket Server running on port ${PORT}`)
})
