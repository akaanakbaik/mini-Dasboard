import { Client, SFTPWrapper } from 'ssh2'
import { FileEntry } from '@/types/file-system'
import path from 'path'

export class SFTPService {
  private sftp: SFTPWrapper | null = null

  constructor(private client: Client) {}

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.sftp((err, sftp) => {
        if (err) return reject(err)
        this.sftp = sftp
        resolve()
      })
    })
  }

  async listDirectory(remotePath: string): Promise<FileEntry[]> {
    if (!this.sftp) throw new Error('SFTP not initialized')

    return new Promise((resolve, reject) => {
      this.sftp!.readdir(remotePath, (err, list) => {
        if (err) return reject(err)

        const entries: FileEntry[] = list.map(item => {
          const isDir = item.longname.startsWith('d')
          return {
            name: item.filename,
            path: path.posix.join(remotePath, item.filename),
            size: item.attrs.size,
            type: isDir ? 'directory' : 'file',
            permissions: item.attrs.mode.toString(8).slice(-3),
            lastModified: item.attrs.mtime * 1000,
            extension: isDir ? undefined : path.extname(item.filename).slice(1)
          }
        })

        const sorted = entries.sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name)
          return a.type === 'directory' ? -1 : 1
        })

        resolve(sorted)
      })
    })
  }

  async createDirectory(remotePath: string): Promise<void> {
    if (!this.sftp) throw new Error('SFTP not initialized')
    return new Promise((resolve, reject) => {
      this.sftp!.mkdir(remotePath, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  async deleteFile(remotePath: string): Promise<void> {
    if (!this.sftp) throw new Error('SFTP not initialized')
    return new Promise((resolve, reject) => {
      this.sftp!.unlink(remotePath, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
}
