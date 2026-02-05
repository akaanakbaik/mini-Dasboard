import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.SSH_ENCRYPT_SECRET || 'default_secret_must_be_32_bytes_long!!';
const IV_LENGTH = 16;

export const encrypt = (text: string) => {
  if (!text) return '';
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

export const decrypt = (text: string) => {
  if (!text) return '';
  const [ivHex, authTagHex, encryptedHex] = text.split(':');
  if (!ivHex || !authTagHex || !encryptedHex) return null;
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export const verifyPin = (inputPin: string) => {
  const correctPin = process.env.DASHBOARD_PIN;
  return inputPin === correctPin;
};
