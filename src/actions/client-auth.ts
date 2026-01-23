'use server'

import { z } from 'zod'

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

export async function verifyClientAccess(osgbName: string, code: string): Promise<VerifyResult> {
    // Artificial delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 500))

    const validation = verifySchema.safeParse({ osgbName, code })

    if (!validation.success) {
        return { success: false, error: 'Geçersiz giriş formatı' }
    }

    const { osgbName: name, code: accessCode } = validation.data

    // Find matching client
    // In a real app, this would check against a Database table (AuthorizedClients)
    const isValid = AUTHORIZED_CLIENTS.some(
        client =>
            client.name.toLowerCase() === name.toLowerCase().trim() &&
            client.code === accessCode.trim()
    )

    if (isValid) {
        return { success: true }
    }

    return { success: false, error: 'Hatalı OSGB Adı veya Erişim Kodu' }
}
