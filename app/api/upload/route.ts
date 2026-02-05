import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'ssh2'
import { decryptData } from '@/lib/encryption'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const host = formData.get('host') as string
    const username = formData.get('username') as string
    const encryptedPassword = formData.get('password') as string
    const remotePath = formData.get('path') as string

    if (!file || !host || !username || !encryptedPassword || !remotePath) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Decrypt password on the fly (Shared Secret Architecture)
    const password = await decryptData(encryptedPassword)
    const buffer = Buffer.from(await file.arrayBuffer())

    // Direct SFTP Stream
    await new Promise<void>((resolve, reject) => {
      const conn = new Client()
      
      conn.on('ready', () => {
        conn.sftp((err, sftp) => {
          if (err) {
            conn.end()
            return reject(err)
          }

          const stream = sftp.createWriteStream(remotePath)
          
          stream.on('close', () => {
            conn.end()
            resolve()
          })
          
          stream.on('error', (e) => {
            conn.end()
            reject(e)
          })

          stream.write(buffer)
          stream.end()
        })
      })

      conn.on('error', (err) => reject(err))

      conn.connect({
        host,
        port: 22,
        username,
        password,
        readyTimeout: 20000
      })
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Upload Error:', error)
    return NextResponse.json({ 
      error: 'Upload Failed', 
      details: error.message 
    }, { status: 500 })
  }
}
