import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'

const ALGORITHM = 'aes-256-gcm'
const SECRET_KEY = process.env.SSH_ENCRYPT_SECRET || 'default-secret-key-must-be-32-bytes!'
const IV_LENGTH = 16 

const keyPromise = (async () => {
  return (await promisify(scrypt)(SECRET_KEY, 'salt', 32)) as Buffer
})()

export async function encryptCredential(text: string): Promise<string> {
  const iv = randomBytes(IV_LENGTH)
  const key = await keyPromise
  const cipher = createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export async function decryptCredential(encryptedText: string): Promise<string> {
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

export function maskIpAddress(ip: string): string {
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`
  }
  return '***.***.***.***'
}

export function validatePathSecurity(requestedPath: string, allowedRoot: string = '/root/furinla'): boolean {
  const normalizedRequested = requestedPath.replace(/\\/g, '/').replace(/\/+$/, '')
  const normalizedRoot = allowedRoot.replace(/\\/g, '/').replace(/\/+$/, '')
  
  return normalizedRequested.startsWith(normalizedRoot) && !normalizedRequested.includes('..')
}
