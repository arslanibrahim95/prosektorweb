'use server'

import { prisma } from '@/server/db'
import { z } from 'zod'
import { verifyIdempotency } from '@/features/system/lib/security/idempotency'
import DOMPurify from 'isomorphic-dompurify'
import { getClientIp } from '@/shared/lib/rate-limit'
import { getUserAgent } from '@/shared/lib/headers'

const contactSchema = z.object({
    name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    phone: z.string().optional(),
    message: z.string().min(10, 'Mesajınız en az 10 karakter olmalıdır'),
    kvkk: z.literal('on', { message: 'KVKK onayı zorunludur' })
})

export type ContactState = {
    success: boolean
    message: string
    errors?: Record<string, string[]>
}

export async function submitContact(prevState: ContactState, formData: FormData): Promise<ContactState> {
    const idempotencyKey = formData.get('idempotencyKey') as string

    // Idempotency: Prevent double submission
    if (idempotencyKey) {
        const isNew = await verifyIdempotency(idempotencyKey)
        if (!isNew) {
            return {
                success: false,
                message: 'Bu mesaj zaten gönderildi. (Çift tıklama algılandı)'
            }
        }
    }

    // 1. Get Security Context (IP & User Agent)
    const ip = await getClientIp()
    const userAgent = await getUserAgent() || 'Unknown'

    // 2. Rate Limiting (Max 5 requests per hour per IP)
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const requestCount = await prisma.contactMessage.count({
            where: {
                ipAddress: ip,
                createdAt: { gt: oneHourAgo }
            }
        })

        if (requestCount >= 5) {
            console.warn(`[RATE LIMIT] blocked IP: ${ip}`)
            return {
                success: false,
                message: 'Çok fazla istek gönderdiniz. Lütfen bir saat sonra tekrar deneyiniz.',
            }
        }
    } catch (error) {
        console.error('Rate limit check failed:', error)
        return { success: false, message: 'Sistem yoğunluğu, lütfen bekleyiniz.' }
    }

    // 3. Validate Validation
    const validatedFields = contactSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message'),
        kvkk: formData.get('kvkk'),
    })

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Lütfen formu kontrol edip tekrar deneyiniz.',
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    // 4. Save to DB with Legal Evidence (Sanitized)
    try {
        await prisma.contactMessage.create({
            data: {
                name: DOMPurify.sanitize(validatedFields.data.name),
                email: validatedFields.data.email,
                phone: validatedFields.data.phone || '',
                message: DOMPurify.sanitize(validatedFields.data.message),
                ipAddress: ip,
                userAgent: userAgent,
                kvkkApprovedAt: new Date(),
            },
        })

        return {
            success: true,
            message: 'Mesajınız başarıyla iletildi. En kısa sürede size dönüş yapacağız.',
        }
    } catch (error) {
        console.error('Contact error:', error)
        return {
            success: false,
            message: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.',
        }
    }
}
