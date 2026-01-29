'use server'

import { z } from 'zod'

import { checkRateLimit, getClientIp } from '@/shared/lib/rate-limit'
import { constantTimeCompare } from '@/shared/lib/security'

const verifySchema = z.object({
    osgbName: z.string().min(1, 'OSGB adı zorunludur'),
    code: z.string().min(1, 'Erişim kodu zorunludur')
})

export type VerifyResult = {
    success: boolean
    error?: string
    previewEndsAt?: string // ISO Date String
}

const AUTHORIZED_CLIENTS = [
    {
        name: process.env.CLIENT_DEMO_NAME || "Evren Ada OSGB",
        code: process.env.CLIENT_DEMO_CODE || "PSW-1234"
    }
]



export async function verifyClientAccess(osgbName: string, code: string): Promise<VerifyResult> {
    const ip = await getClientIp()
    const limit = await checkRateLimit(`auth:${ip}`, {
        limit: 5,
        windowSeconds: 15 * 60,
        failClosed: true // Security-critical: block on Redis errors
    })

    if (!limit.success) {
        return { success: false, error: 'Çok fazla deneme yaptınız. Lütfen 15 dakika bekleyin.' }
    }
    const validation = verifySchema.safeParse({ osgbName, code })

    if (!validation.success) {
        return { success: false, error: 'Geçersiz giriş formatı' }
    }

    const { osgbName: name, code: accessCode } = validation.data

    // Find matching client - but DON'T compare yet
    const authorizedClient = AUTHORIZED_CLIENTS.find(
        client => client.name.toLowerCase() === name.toLowerCase().trim()
    )

    if (!authorizedClient) {
        // Use constant-time compare even for non-existent clients
        constantTimeCompare(accessCode.trim(), AUTHORIZED_CLIENTS[0].code)
        return { success: false, error: 'Hatalı OSGB Adı veya Erişim Kodu' }
    }

    // Constant-time comparison
    const isValid = constantTimeCompare(
        accessCode.trim(),
        authorizedClient.code
    )

    if (isValid) {
        // Log Success
        await import('@/shared/lib').then(m => m.createAuditLog({
            action: 'LOGIN_SUCCESS',
            entity: 'Client',
            entityId: authorizedClient.name,
            details: { osgbName, ip },
            ipAddress: ip
        }))
    } else {
        // Log Failure
        await import('@/shared/lib').then(m => m.createAuditLog({
            action: 'LOGIN_FAILED',
            entity: 'Client',
            details: { osgbName, ip, error: 'Invalid Credentials' },
            ipAddress: ip
        }))
    }

    // In production, we fetch this from DB based on Authorized Client link
    // FIXED: Using a fixed date for the demo client to prevent infinite trial extension on every login
    // In a real DB scenario, this would be `authorizedClient.expiresAt`
    const demoExpirationDate = new Date('2026-02-01T00:00:00Z') // Fixed date for demo
    const previewEndsAt = isValid ? demoExpirationDate : new Date()

    return isValid
        ? { success: true, previewEndsAt: previewEndsAt.toISOString() }
        : { success: false, error: 'Hatalı OSGB Adı veya Erişim Kodu' }
}
