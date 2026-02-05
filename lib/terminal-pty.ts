import { Client } from 'ssh2';

export function setupTerminalStream(sshClient: Client, socket: any) {
  sshClient.shell({ term: 'xterm-256color' }, (err, stream) => {
    if (err) {
      socket.emit('terminal:output', `\r\n\x1b[31m[!] SSH Shell Error: ${err.message}\x1b[0m\r\n`);
      return;
    }

    // Input from Frontend to SSH
    socket.on('terminal:input', (data: string) => {
      stream.write(data);
    });

    // Output from SSH to Frontend
    stream.on('data', (data: Buffer) => {
      socket.emit('terminal:output', data.toString());
    });

    stream.on('close', () => {
      socket.emit('terminal:output', '\r\n\x1b[33m[!] SSH Session Closed\x1b[0m\r\n');
    });

    socket.on('disconnect', () => {
      stream.end();
    });
  });
}
