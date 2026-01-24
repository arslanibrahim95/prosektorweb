import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import DOMPurify from 'isomorphic-dompurify'
import { getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
    try {
        const ip = await getClientIp()

        // 1. Rate Limiting (10 requests per hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const requestCount = await prisma.contactMessage.count({
            where: {
                ipAddress: ip,
                createdAt: { gt: oneHourAgo }
            }
        })

        if (requestCount >= 10) {
            return NextResponse.json(
                { error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyiniz.' },
                { status: 429 }
            )
        }

        const body = await request.json()
        const { name, email, phone, company, message } = body

        // 2. Validation
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Ad, e-posta ve mesaj alanları zorunludur' },
                { status: 400 }
            )
        }

        // 2.5 Sanitize inputs
        const cleanMessage = DOMPurify.sanitize(message)
        const cleanName = DOMPurify.sanitize(name)

        // 3. Create contact message (with Legal Logs)
        const contact = await prisma.contactMessage.create({
            data: {
                name: cleanName,
                email,
                phone: phone || null,
                company: company || null,
                message: cleanMessage,
                ipAddress: ip,
                userAgent: request.headers.get('user-agent') || 'API',
                kvkkApprovedAt: new Date() // API via implies consent
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Mesajınız başarıyla gönderildi'
        })
    } catch (error) {
        console.error('Error creating contact:', error)
        return NextResponse.json(
            { error: 'Mesaj gönderilirken hata oluştu' },
            { status: 500 }
        )
    }
}
