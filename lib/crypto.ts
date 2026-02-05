import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.SSH_ENCRYPT_SECRET || 'default_secret_key_must_be_changed';
const SALT = 'furinla_secure_salt';

const getKey = () => scryptSync(SECRET_KEY, SALT, 32);

export const encrypt = (text: string) => {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    iv: iv.toString('hex'),
    content: encrypted,
    tag: authTag
  };
};

export const decrypt = (hash: { iv: string; content: string; tag: string }) => {
  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(hash.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(hash.tag, 'hex'));
  let decrypted = decipher.update(hash.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
