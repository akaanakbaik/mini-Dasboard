import { SSHInstance } from './ssh-instance.js'

export class ProcessCore {
  constructor(private ssh: SSHInstance) {}

  async list() {
    try {
      const raw = await this.ssh.exec('pm2 jlist')
      const processes = JSON.parse(raw).map((p: any) => ({
        id: p.pm_id,
        name: p.name,
        status: p.pm2_env.status,
        cpu: p.monit.cpu,
        memory: p.monit.memory,
        uptime: Date.now() - p.pm2_env.pm_uptime,
        mode: p.pm2_env.exec_mode,
        instances: p.pm2_env.instances
      }))
      return processes
    } catch (error) {
      console.error('PM2 List Error:', error)
      return []
    }
  }

  async action(action: 'start' | 'stop' | 'restart' | 'delete', id: number | string) {
    if (!['start', 'stop', 'restart', 'delete'].includes(action)) {
      throw new Error('Invalid PM2 action')
    }
    
    // Safety: Ensure ID is number or specific string to prevent injection
    const safeId = String(id).replace(/[^0-9a-zA-Z-_]/g, '')
    return await this.ssh.exec(`pm2 ${action} ${safeId}`)
  }
}
