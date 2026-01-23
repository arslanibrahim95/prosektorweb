'use server'

import { z } from 'zod'
import { constantTimeCompare } from '@/lib/auth/crypto'

const verifySchema = z.object({
    osgbName: z.string().min(1, 'OSGB adı zorunludur'),
    code: z.string().min(1, 'Erişim kodu zorunludur')
})

export type VerifyResult = {
    success: boolean
    error?: string
}

const AUTHORIZED_CLIENTS = [
    {
        name: process.env.CLIENT_DEMO_NAME || "Evren Ada OSGB",
        code: process.env.CLIENT_DEMO_CODE || "PSW-1234"
    }
]

import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function verifyClientAccess(osgbName: string, code: string): Promise<VerifyResult> {
    const ip = await getClientIp()
    const limit = await checkRateLimit(`auth:${ip}`, 5, 15 * 60) // 5 attempts per 15 min

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

    return isValid ? { success: true } : { success: false, error: 'Hatalı OSGB Adı veya Erişim Kodu' }
}
