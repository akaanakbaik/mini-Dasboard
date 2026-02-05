import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'

const ALGORITHM = 'aes-256-gcm'
const SECRET_KEY = process.env.SSH_ENCRYPT_SECRET as string
const IV_LENGTH = 16 

if (!SECRET_KEY || SECRET_KEY.length !== 32) {
  throw new Error('SSH_ENCRYPT_SECRET must be exactly 32 chars')
}

const keyPromise = (async () => {
  return (await promisify(scrypt)(SECRET_KEY, 'salt', 32)) as Buffer
})()

export async function encryptData(text: string): Promise<string> {
  const iv = randomBytes(IV_LENGTH)
  const key = await keyPromise
  const cipher = createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export async function decryptData(encryptedText: string): Promise<string> {
  const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':')
  
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Invalid encrypted format')
  }

  const key = await keyPromise
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
