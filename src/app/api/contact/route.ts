import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, phone, company, message } = body

        // Validation
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Ad, e-posta ve mesaj alanları zorunludur' },
                { status: 400 }
            )
        }

        // Create contact message
        const contact = await prisma.contactMessage.create({
            data: {
                name,
                email,
                phone: phone || null,
                company: company || null,
                message
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
