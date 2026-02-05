import { Socket } from 'socket.io'
import { Client } from 'ssh2'

export function setupPm2Socket(socket: Socket, sshClient: Client) {
  const executePm2 = (command: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      sshClient.exec(command, (err, stream) => {
        if (err) return reject(err)
        let data = ''
        stream.on('data', (chunk: Buffer) => { data += chunk.toString() })
        stream.on('close', () => resolve(data))
        stream.stderr.on('data', (chunk) => console.error('PM2 Error:', chunk.toString()))
      })
    })
  }

  socket.on('pm2:list', async () => {
    try {
      const raw = await executePm2('pm2 jlist')
      const processes = JSON.parse(raw).map((p: any) => ({
        pid: p.pid,
        name: p.name,
        pm_id: p.pm_id,
        status: p.pm2_env.status,
        cpu: p.monit.cpu,
        memory: p.monit.memory,
        uptime: formatUptime(Date.now() - p.pm2_env.pm_uptime)
      }))
      socket.emit('pm2:list:data', processes)
    } catch (error) {
      socket.emit('pm2:error', { message: 'Failed to fetch process list' })
    }
  })

  socket.on('pm2:action', async ({ action, id }) => {
    try {
      if (!['start', 'stop', 'restart', 'delete'].includes(action)) return
      await executePm2(`pm2 ${action} ${id}`)
      socket.emit('pm2:action:success', { action, id })
      
      const raw = await executePm2('pm2 jlist')
      const processes = JSON.parse(raw).map((p: any) => ({
        pid: p.pid,
        name: p.name,
        pm_id: p.pm_id,
        status: p.pm2_env.status,
        cpu: p.monit.cpu,
        memory: p.monit.memory,
        uptime: formatUptime(Date.now() - p.pm2_env.pm_uptime)
      }))
      socket.emit('pm2:list:data', processes)
    } catch (error: any) {
      socket.emit('pm2:error', { message: error.message })
    }
  })
}

function formatUptime(ms: number) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return `${seconds}s`
}
