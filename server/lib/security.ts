import { createDecipheriv, scrypt } from 'crypto'
import { promisify } from 'util'

const ALGORITHM = 'aes-256-gcm'
const SECRET_KEY = process.env.SSH_ENCRYPT_SECRET

if (!SECRET_KEY || SECRET_KEY.length !== 32) {
  console.error('❌ FATAL: SSH_ENCRYPT_SECRET is missing or invalid in Backend .env')
  process.exit(1)
}

const keyPromise = (async () => {
  return (await promisify(scrypt)(SECRET_KEY, 'salt', 32)) as Buffer
})()

export async function decryptCredential(encryptedData: string): Promise<string> {
  try {
    const [ivHex, authTagHex, encryptedHex] = encryptedData.split(':')
    
    if (!ivHex || !authTagHex || !encryptedHex) {
      throw new Error('Invalid encrypted structure')
    }

    const key = await keyPromise
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const decipher = createDecipheriv(ALGORITHM, key, iv)
    
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption Failed:', error)
    throw new Error('Failed to decrypt credentials. Check SECRET_KEY match.')
  }
}
