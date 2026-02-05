import { Server } from 'socket.io';
import { SSHEngine } from '../lib/ssh-engine';
import { decryptCredential } from '../lib/security';

export function setupSocketServer(server: any) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    let ssh = new SSHEngine();

    socket.on('ssh:connect', async (config) => {
      try {
        // Decrypt password on the fly for security
        const decryptedPassword = await decryptCredential(config.password);
        await ssh.connect({ ...config, password: decryptedPassword });
        
        socket.emit('ssh:status', { connected: true });
        
        // Start resource monitoring loop
        const monitorInterval = setInterval(async () => {
          if (!socket.connected) return clearInterval(monitorInterval);
          const stats = await ssh.executeCommand("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' && free -m | grep Mem | awk '{print $3/$2 * 100}'");
          const [cpu, ram] = stats.split('\n');
          socket.emit('vps:stats', { cpu: parseFloat(cpu), ram: parseFloat(ram) });
        }, 2000);

      } catch (err: any) {
        socket.emit('ssh:error', { message: err.message });
      }
    });

    socket.on('terminal:input', (data) => {
      // Logic for xterm.js pty stream will go here
    });

    socket.on('disconnect', () => {
      ssh.dispose();
    });
  });

  return io;
}
