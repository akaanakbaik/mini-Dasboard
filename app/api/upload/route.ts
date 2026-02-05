import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'ssh2'
import { decryptCredential } from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const remotePath = formData.get('path') as string
    const host = formData.get('host') as string
    const username = formData.get('username') as string
    const encryptedPassword = formData.get('password') as string

    if (!file || !remotePath || !encryptedPassword) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const password = await decryptCredential(encryptedPassword)
    const buffer = Buffer.from(await file.arrayBuffer())

    const ssh = new Client()
    
    await new Promise<void>((resolve, reject) => {
      ssh.on('ready', () => {
        ssh.sftp((err, sftp) => {
          if (err) {
            ssh.end()
            return reject(err)
          }

          const writeStream = sftp.createWriteStream(remotePath)
          
          writeStream.on('close', () => {
            ssh.end()
            resolve()
          })

          writeStream.on('error', (e) => {
            ssh.end()
            reject(e)
          })

          writeStream.write(buffer)
          writeStream.end()
        })
      }).on('error', (err) => {
        reject(err)
      }).connect({
        host,
        port: 22,
        username,
        password
      })
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
