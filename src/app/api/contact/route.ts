import { prisma } from '@/lib/prisma'
import DOMPurify from 'isomorphic-dompurify'
import { getClientIp } from '@/lib/rate-limit'
import { safeApi } from '@/lib/safe-api'

export const POST = safeApi(async (request) => {
    const ip = await getClientIp()
    const body = await request.json()
    const { name, email, phone, company, message } = body

    // Validation
    if (!name || !email || !message) {
        throw new Error('Ad, e-posta ve mesaj alanları zorunludur')
    }

    // Sanitize inputs
    const cleanMessage = DOMPurify.sanitize(message)
    const cleanName = DOMPurify.sanitize(name)

    // Create contact message
    const contact = await prisma.contactMessage.create({
        data: {
            name: cleanName,
            email,
            phone: phone || null,
            company: company || null,
            message: cleanMessage,
            ipAddress: ip,
            userAgent: request.headers.get('user-agent') || 'API',
            kvkkApprovedAt: new Date()
        }
    })

    return {
        data: true,
        message: 'Mesajınız başarıyla gönderildi'
    }
}, {
    rateLimit: { limit: 10, windowSeconds: 3600 },
    checkCsrf: true
})
