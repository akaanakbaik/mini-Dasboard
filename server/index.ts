import 'dotenv/config'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { SocketManager } from './managers/socket-manager.js'

const PORT = process.env.PORT || 3001

const httpServer = createServer((req, res) => {
  // Basic health check
  res.writeHead(200)
  res.end('Furinla Realtime Gateway is Running')
})

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Dalam production, ganti dengan domain Vercel Anda
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  transports: ['websocket', 'polling']
})

console.clear()
console.log('\x1b[36m%s\x1b[0m', '🚀 FURINLA SECURE GATEWAY STARTING...')
console.log('\x1b[33m%s\x1b[0m', `🔐 Encryption Mode: AES-256-GCM`)

io.on('connection', (socket) => {
  console.log(`\x1b[32m[+] Client Connected: ${socket.id}\x1b[0m`)
  new SocketManager(io, socket)
})

httpServer.listen(PORT, () => {
  console.log(`\x1b[42m\x1b[30m READY \x1b[0m Server listening on port ${PORT}`)
})
