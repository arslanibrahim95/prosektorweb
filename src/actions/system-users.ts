'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

const SystemUserSchema = z.object({
    email: z.string().email('Geçerli bir e-posta giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
    name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
    role: z.nativeEnum(UserRole)
})

export async function createSystemUser(formData: FormData) {
    try {
        await requireAuth(['ADMIN'])

        const rawData = {
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name'),
            role: formData.get('role')
        }

        const validated = SystemUserSchema.parse(rawData)

        // Check duplicate
        const existing = await prisma.systemUser.findUnique({ where: { email: validated.email } })
        if (existing) {
            return { success: false, error: 'Bu e-posta adresi zaten kayıtlı.' }
        }

        const hashedPassword = await bcrypt.hash(validated.password, 10)

        await prisma.systemUser.create({
            data: {
                email: validated.email,
                password: hashedPassword,
                name: validated.name,
                role: validated.role,
                isActive: true
            }
        })

        revalidatePath('/admin/system-users')
        return { success: true }
    } catch (error) {
        console.error('createSystemUser error:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        return { success: false, error: 'Kullanıcı oluşturulamadı.' }
    }
}

export async function deleteSystemUser(id: string) {
    try {
        await requireAuth(['ADMIN'])
        await prisma.systemUser.delete({ where: { id } })
        revalidatePath('/admin/system-users')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Silme işlemi başarısız.' }
    }
}

export async function getSystemUsers() {
    try {
        await requireAuth(['ADMIN'])
        return await prisma.systemUser.findMany({
            orderBy: { createdAt: 'desc' }
        })
    } catch (error) {
        return []
    }
}
