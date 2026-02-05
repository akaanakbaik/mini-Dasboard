import { Client } from 'ssh2';
import { decryptCredential } from './security';

export interface SSHConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
}

export class SSHEngine {
  private client: Client;

  constructor() {
    this.client = new Client();
  }

  async connect(config: SSHConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client
        .on('ready', () => resolve())
        .on('error', (err) => reject(err))
        .connect({
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          privateKey: config.privateKey,
          readyTimeout: 20000,
        });
    });
  }

  async executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.exec(command, (err, stream) => {
        if (err) return reject(err);
        let data = '';
        stream
          .on('close', () => resolve(data))
          .on('data', (chunk: Buffer) => {
            data += chunk.toString();
          })
          .stderr.on('data', (chunk: Buffer) => {
            data += chunk.toString();
          });
      });
    });
  }

  getRawClient() {
    return this.client;
  }

  dispose() {
    this.client.end();
  }
}
