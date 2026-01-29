import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

/**
 * Encrypt a string using AES-256-GCM
 */
export function encrypt(text: string): string {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte hex string (64 characters)')
  }

  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag().toString('hex')

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

/**
 * Check if a string follows the encrypted format
 */
export function isEncrypted(text: string): boolean {
  if (!text || typeof text !== 'string') return false
  const parts = text.split(':')
  return parts.length === 3 && parts.every(part => /^[a-f0-9]+$/i.test(part))
}

/**
 * Decrypt wrapper for sensitive data (Legacy naming support)
 */
export function decryptSensitive(encryptedData: string): string {
  return decrypt(encryptedData)
}

/**
 * Decrypt a string using AES-256-GCM
 */
export function decrypt(encryptedData: string): string {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte hex string (64 characters)')
  }

  const [ivHex, authTagHex, encryptedText] = encryptedData.split(':')
  if (!ivHex || !authTagHex || !encryptedText) {
    throw new Error('Invalid encrypted data format')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv)

  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function constantTimeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)

    if (bufA.length !== bufB.length) {
      // Still perform a comparison to maintain similar timing even if lengths differ
      crypto.timingSafeEqual(bufA, bufA)
      return false
    }

    return crypto.timingSafeEqual(bufA, bufB)
  } catch (e) {
    return false
  }
}
