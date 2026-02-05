import { Socket } from 'socket.io'
import { Client } from 'ssh2'
import { SFTPService } from '../lib/sftp-wrapper'

export function setupFileSocket(socket: Socket, sshClient: Client) {
  let sftpService: SFTPService | null = null

  const getService = async () => {
    if (!sftpService) {
      sftpService = new SFTPService(sshClient)
      await sftpService.init()
    }
    return sftpService
  }

  socket.on('files:list', async ({ path }) => {
    try {
      const service = await getService()
      const files = await service.listDirectory(path)
      socket.emit('files:list:data', files)
    } catch (error: any) {
      socket.emit('files:error', { message: error.message })
    }
  })

  socket.on('files:mkdir', async ({ path }) => {
    try {
      const service = await getService()
      await service.createDirectory(path)
      socket.emit('files:action:success', { action: 'mkdir', path })
      
      // Auto refresh list
      const parentDir = path.split('/').slice(0, -1).join('/')
      const files = await service.listDirectory(parentDir)
      socket.emit('files:list:data', files)
    } catch (error: any) {
      socket.emit('files:error', { message: error.message })
    }
  })

  socket.on('files:delete', async ({ path }) => {
    try {
      const service = await getService()
      await service.deleteFile(path)
      socket.emit('files:action:success', { action: 'delete', path })
    } catch (error: any) {
      socket.emit('files:error', { message: error.message })
    }
  })
}
