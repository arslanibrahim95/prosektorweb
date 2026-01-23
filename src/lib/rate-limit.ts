import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function getClientIp() {
    // In Next.js Server Actions, we can access headers
    const h = await headers()
    // 'x-forwarded-for' is standard but review warned it's spoofable.
    // However, in Vercel/Cloudflare environment, the first IP in x-forwarded-for is usually trustworthy if configured correctly.
    // The review said: "Use a trusted proxy header (e.g., x-real-ip) or deploy edge-level rate limiting"
    // Since we are in app code, we'll try x-real-ip then x-forwarded-for.
    const realIp = h.get('x-real-ip')
    const forwardedFor = h.get('x-forwarded-for')

    if (realIp) return realIp
    if (forwardedFor) return forwardedFor.split(',')[0].trim()
    return '127.0.0.1'
}

/**
 * Check rate limit for a given key (IP or identifier)
 * @param identifier Unique key (e.g. URI + IP)
 * @param limit Max requests
 * @param windowSeconds Window in seconds
 * @returns { success: boolean, reset: Date }
 */
export async function checkRateLimit(identifier: string, limit: number = 10, windowSeconds: number = 60) {
    const key = `rate_limit:${identifier}`
    const now = new Date()

    try {
        // Clean up expired (optional, doing it lazily on access or via cron is better, but here we do it transactionally/lazily)
        // Prisma upsert is good here.

        // Strategy: 
        // 1. Upsert: create if new, update if exists (but strictly we need to check expiry first)

        // Let's fetch first
        const record = await prisma.rateLimit.findUnique({
            where: { key }
        })

        // If no record or expired
        if (!record || record.expiresAt < now) {
            const expiresAt = new Date(now.getTime() + windowSeconds * 1000)
            await prisma.rateLimit.upsert({
                where: { key },
                create: {
                    key,
                    points: 1,
                    expiresAt
                },
                update: {
                    points: 1,
                    expiresAt
                }
            })
            return { success: true }
        }

        // If record active
        if (record.points >= limit) {
            return { success: false, reset: record.expiresAt }
        }

        // Increment
        await prisma.rateLimit.update({
            where: { key },
            data: {
                points: { increment: 1 }
            }
        })

        return { success: true }

    } catch (e) {
        console.error("Rate limit error", e)
        // If DB fails, fail open or closed? 
        // Security-wise: Fail Closed. But reliability-wise: Fail Open is common.
        // User asked for Fail-Closed on financial/external APIs. For rate limit internal DB error?
        // Let's assume valid access if DB is down to avoid DoS-ing valid users during maintenance, 
        // unless it's critical login.
        return { success: true }
    }
}
