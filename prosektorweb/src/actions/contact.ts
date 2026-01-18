'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const contactSchema = z.object({
    name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    phone: z.string().optional(),
    message: z.string().min(10, 'Mesajınız en az 10 karakter olmalıdır'),
    kvkk: z.literal('on', { errorMap: () => ({ message: 'KVKK onayı zorunludur' }) })
})

export type ContactState = {
    success: boolean
    message: string
    errors?: Record<string, string[]>
}

export async function submitContact(prevState: ContactState, formData: FormData): Promise<ContactState> {
    // Validate fields
    const validatedFields = contactSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message'),
        kvkk: formData.get('kvkk'),
    })

    // Return errors if validation fails
    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Lütfen formu kontrol edip tekrar deneyiniz.',
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    // Save to database
    try {
        await prisma.contactMessage.create({
            data: {
                name: validatedFields.data.name,
                email: validatedFields.data.email,
                phone: validatedFields.data.phone || '',
                message: validatedFields.data.message,
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
