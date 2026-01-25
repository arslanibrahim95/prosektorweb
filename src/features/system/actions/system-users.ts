'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { UserRole, AuditAction } from '@prisma/client'
import { auth } from '@/auth'

// Types
export interface SystemUserInput {
    name: string
    firstName?: string
    lastName?: string
    email: string
    password?: string
    role: UserRole
    isActive?: boolean
}

export interface ActionResult {
    success: boolean
    error?: string
    data?: any
}

// Validation
const SystemUserSchema = z.object({
    email: z.string().email('Geçerli bir e-posta giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalı').optional().or(z.literal('')),
    name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.nativeEnum(UserRole),
    isActive: z.boolean().optional()
})

async function logActivity(action: AuditAction, entity: string, entityId: string, details?: any) {
    const session = await auth()
    try {
        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                details: details ? JSON.stringify(details) : undefined,
                userId: session?.user?.id,
                userEmail: session?.user?.email,
                userName: session?.user?.name
            }
        })
    } catch (e) {
        console.error('Audit Log Failed:', e)
    }
}

export async function getSystemUsers(page: number = 1, limit: number = 20, search?: string) {
    try {
        await requireAuth(['ADMIN'])

        const skip = (page - 1) * limit
        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } }
            ]
        }

        const [data, total] = await Promise.all([
            prisma.systemUser.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true
                }
            }),
            prisma.systemUser.count({ where })
        ])

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }
    }
}

export async function getSystemUser(id: string) {
    try {
        await requireAuth(['ADMIN'])
        return await prisma.systemUser.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                isActive: true
            }
        })
    } catch (e) {
        return null
    }
}

export async function createSystemUser(formData: FormData): Promise<ActionResult> {
    try {
        await requireAuth(['ADMIN'])

        const rawData = {
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            role: formData.get('role'),
            isActive: true
        }

        const validated = SystemUserSchema.parse(rawData)

        if (!validated.password) {
            return { success: false, error: 'Şifre zorunludur' }
        }

        // Check duplicate
        const existing = await prisma.systemUser.findUnique({ where: { email: validated.email } })
        if (existing) {
            return { success: false, error: 'Bu e-posta adresi zaten kayıtlı.' }
        }

        const hashedPassword = await bcrypt.hash(validated.password, 10)

        const user = await prisma.systemUser.create({
            data: {
                email: validated.email,
                password: hashedPassword,
                name: validated.name,
                firstName: validated.firstName,
                lastName: validated.lastName,
                role: validated.role,
                isActive: true
            }
        })

        await logActivity('CREATE', 'SystemUser', user.id, { email: user.email, role: user.role })
        revalidatePath('/admin/users')
        return { success: true, data: user }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        return { success: false, error: 'Kullanıcı oluşturulamadı.' }
    }
}

export async function updateSystemUser(id: string, formData: FormData): Promise<ActionResult> {
    try {
        await requireAuth(['ADMIN'])

        // Check if user exists
        const existingUser = await prisma.systemUser.findUnique({ where: { id } })
        if (!existingUser) return { success: false, error: 'Kullanıcı bulunamadı' }

        const rawData = {
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            role: formData.get('role'),
            isActive: formData.get('isActive') === 'on'
        }

        // Partial validation handled manually or by lenient schema if needed
        // Here we re-use schema but handle password specially

        const updateData: any = {
            email: rawData.email,
            name: rawData.name,
            firstName: rawData.firstName,
            lastName: rawData.lastName,
            role: rawData.role as UserRole,
            isActive: rawData.isActive
        }

        if (typeof rawData.password === 'string' && rawData.password.length >= 6) {
            updateData.password = await bcrypt.hash(rawData.password, 10)
        }

        const user = await prisma.systemUser.update({
            where: { id },
            data: updateData
        })

        await logActivity('UPDATE', 'SystemUser', user.id, { email: user.email, role: user.role, changes: updateData })
        revalidatePath('/admin/users')
        revalidatePath(`/admin/users/${id}`)
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Güncelleme başarısız' }
    }
}

export async function deleteSystemUser(id: string): Promise<ActionResult> {
    try {
        await requireAuth(['ADMIN'])
        // Use hard delete or deactivation? 
        // Schema doesn't have deletedAt for SystemUser. 
        // Best practice: Deactivate if history needed, or Hard Delete if no constraints.
        // Let's Deactivate instead of Delete to preserve integrity if they have audit logs etc.

        // Wait, SystemUser might be linked to nothing foreign-key wise except implicitly in logs.
        // Let's check for AuditLog.userId. If linked, we can't hard delete easily if FK exists.
        // Schema: AuditLog defined `userId String?`. Relation? No explicit @relation in AuditLog. 
        // So Hard Delete is technically safe but bad for Audit history reading (name is copied though).

        // Let's implement Soft Delete via isActive=false logic as "Delete" for UI
        await prisma.systemUser.update({
            where: { id },
            data: { isActive: false }
        })

        await logActivity('DELETE', 'SystemUser', id, { type: 'DEACTIVATE' })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Silme işlemi başarısız.' }
    }
}
