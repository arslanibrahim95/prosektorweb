import crypto from 'crypto'

/**
 * Generate a secure random token for password resets.
 */
export function generateResetToken(): { token: string; hash: string } {
    const token = crypto.randomBytes(32).toString('hex')
    const hash = crypto.createHash('sha256').update(token).digest('hex')

    return { token, hash }
}

/**
 * Hash a token for database comparison.
 */
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
}
