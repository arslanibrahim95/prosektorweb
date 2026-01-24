import { headers } from 'next/headers'

export async function checkOrigin() {
    const headerStore = await headers()
    const origin = headerStore.get('origin')
    const host = headerStore.get('host')

    // If no origin (server-to-server), typically safe, but for browser POST/PUT it should differ.
    // However, secure context standard behavior. 
    // If origin is present, it MUST match host (or predefined domain).

    if (origin) {
        // Simple check: Origin should end with Host
        // Remove protocol from origin
        const cleanOrigin = origin.replace(/^https?:\/\//, '')

        if (cleanOrigin !== host) {
            // Check if it's a allowed CORS domain if needed, but for internal portal it should be strict.
            return false
        }
    }
    return true
}
