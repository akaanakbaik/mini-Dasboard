import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useVpsStore } from '@/store/vps-store'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { activeProfile, setConnected } = useVpsStore()

  useEffect(() => {
    if (!activeProfile) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    
    const socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      setIsConnected(true)
      setConnected(true)
      
      socket.emit('ssh:connect', {
        host: activeProfile.ip_address,
        port: activeProfile.ssh_port,
        username: activeProfile.username,
        encryptedPassword: activeProfile.encrypted_password
      })
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      setConnected(false)
    })

    socket.on('ssh:error', (err) => {
      console.error('SSH Connection Error:', err)
      setIsConnected(false)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [activeProfile, setConnected])

  return {
    socket: socketRef.current,
    isConnected
  }
}
