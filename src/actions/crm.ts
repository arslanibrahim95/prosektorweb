'use server'

import { prisma } from '@/lib/prisma'
import { getErrorMessage, getZodErrorMessage } from '@/lib/action-types'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ==========================================
// TYPES
// ==========================================

export interface CrmActionResult {
    success: boolean
    data?: any
    error?: string
}

// ==========================================
// COMPANY NOTES
// ==========================================

const NoteSchema = z.object({
    companyId: z.string().min(1),
    content: z.string().min(1, 'Not içeriği boş olamaz'),
})

export async function createNote(formData: FormData): Promise<CrmActionResult> {
    try {
        await requireAuth()

        const rawData = {
            companyId: formData.get('companyId') as string,
            content: formData.get('content') as string,
        }

        const validated = NoteSchema.parse(rawData)

        const note = await prisma.companyNote.create({
            data: validated,
        })

        revalidatePath(`/admin/companies/${validated.companyId}`)
        return { success: true, data: note }
    } catch (error: unknown) {
        console.error('createNote error:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }
        return { success: false, error: 'Not eklenirken hata oluştu.' }
    }
}

export async function deleteNote(id: string, companyId: string): Promise<CrmActionResult> {
    try {
        await requireAuth()

        await prisma.companyNote.delete({ where: { id } })
        revalidatePath(`/admin/companies/${companyId}`)
        return { success: true }
    } catch (error) {
        console.error('deleteNote error:', error)
        return { success: false, error: 'Not silinirken hata oluştu.' }
    }
}

export async function toggleNotePin(id: string, companyId: string): Promise<CrmActionResult> {
    try {
        await requireAuth()

        const note = await prisma.companyNote.findUnique({ where: { id } })
        if (!note) return { success: false, error: 'Not bulunamadı.' }

        await prisma.companyNote.update({
            where: { id },
            data: { isPinned: !note.isPinned },
        })

        revalidatePath(`/admin/companies/${companyId}`)
        return { success: true }
    } catch (error) {
        console.error('toggleNotePin error:', error)
        return { success: false, error: 'İşlem başarısız.' }
    }
}

// ==========================================
// COMPANY CONTACTS
// ==========================================

const ContactSchema = z.object({
    companyId: z.string().min(1),
    name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
    title: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    isPrimary: z.boolean().optional(),
})

export async function createContact(formData: FormData): Promise<CrmActionResult> {
    try {
        await requireAuth()

        const rawData = {
            companyId: formData.get('companyId') as string,
            name: formData.get('name') as string,
            title: formData.get('title') as string || undefined,
            phone: formData.get('phone') as string || undefined,
            email: formData.get('email') as string || undefined,
            isPrimary: formData.get('isPrimary') === 'on',
        }

        const validated = ContactSchema.parse(rawData)

        // If this is primary, remove primary from others
        if (validated.isPrimary) {
            await prisma.companyContact.updateMany({
                where: { companyId: validated.companyId },
                data: { isPrimary: false },
            })
        }

        const contact = await prisma.companyContact.create({
            data: {
                companyId: validated.companyId,
                name: validated.name,
                title: validated.title || null,
                phone: validated.phone || null,
                email: validated.email || null,
                isPrimary: validated.isPrimary || false,
            },
        })

        revalidatePath(`/admin/companies/${validated.companyId}`)
        return { success: true, data: contact }
    } catch (error: unknown) {
        console.error('createContact error:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }
        return { success: false, error: 'Kişi eklenirken hata oluştu.' }
    }
}

export async function deleteContact(id: string, companyId: string): Promise<CrmActionResult> {
    try {
        await requireAuth()

        await prisma.companyContact.delete({ where: { id } })
        revalidatePath(`/admin/companies/${companyId}`)
        return { success: true }
    } catch (error) {
        console.error('deleteContact error:', error)
        return { success: false, error: 'Kişi silinirken hata oluştu.' }
    }
}

// ==========================================
// COMPANY ACTIVITIES
// ==========================================

const ActivitySchema = z.object({
    companyId: z.string().min(1),
    type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK', 'REMINDER']),
    title: z.string().min(1, 'Başlık gerekli'),
    description: z.string().optional(),
    dueDate: z.string().optional(),
})

export async function createActivity(formData: FormData): Promise<CrmActionResult> {
    try {
        await requireAuth()

        const rawData = {
            companyId: formData.get('companyId') as string,
            type: formData.get('type') as string,
            title: formData.get('title') as string,
            description: formData.get('description') as string || undefined,
            dueDate: formData.get('dueDate') as string || undefined,
        }

        const validated = ActivitySchema.parse(rawData)

        const activity = await prisma.companyActivity.create({
            data: {
                companyId: validated.companyId,
                type: validated.type as any,
                title: validated.title,
                description: validated.description || null,
                dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
            },
        })

        revalidatePath(`/admin/companies/${validated.companyId}`)
        return { success: true, data: activity }
    } catch (error: unknown) {
        console.error('createActivity error:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }
        return { success: false, error: 'Aktivite eklenirken hata oluştu.' }
    }
}

export async function toggleActivityComplete(id: string, companyId: string): Promise<CrmActionResult> {
    try {
        await requireAuth()

        const activity = await prisma.companyActivity.findUnique({ where: { id } })
        if (!activity) return { success: false, error: 'Aktivite bulunamadı.' }

        await prisma.companyActivity.update({
            where: { id },
            data: { isCompleted: !activity.isCompleted },
        })

        revalidatePath(`/admin/companies/${companyId}`)
        return { success: true }
    } catch (error) {
        console.error('toggleActivityComplete error:', error)
        return { success: false, error: 'İşlem başarısız.' }
    }
}

export async function deleteActivity(id: string, companyId: string): Promise<CrmActionResult> {
    try {
        await requireAuth()

        await prisma.companyActivity.delete({ where: { id } })
        revalidatePath(`/admin/companies/${companyId}`)
        return { success: true }
    } catch (error) {
        console.error('deleteActivity error:', error)
        return { success: false, error: 'Aktivite silinirken hata oluştu.' }
    }
}

// ==========================================
// COMPANY STATUS UPDATE
// ==========================================

export async function updateCompanyStatus(id: string, status: string): Promise<CrmActionResult> {
    try {
        await requireAuth()

        await prisma.company.update({
            where: { id },
            data: { status: status as any },
        })

        revalidatePath('/admin/companies')
        revalidatePath(`/admin/companies/${id}`)
        return { success: true }
    } catch (error) {
        console.error('updateCompanyStatus error:', error)
        return { success: false, error: 'Durum güncellenirken hata oluştu.' }
    }
}

// ==========================================
// CRM DASHBOARD STATS
// ==========================================

export async function getCrmStats() {
    try {
        await requireAuth(['ADMIN'])
        const [lead, prospect, negotiation, customer, churned, pendingActivities] = await Promise.all([
            prisma.company.count({ where: { status: 'LEAD' } }),
            prisma.company.count({ where: { status: 'PROSPECT' } }),
            prisma.company.count({ where: { status: 'NEGOTIATION' } }),
            prisma.company.count({ where: { status: 'CUSTOMER' } }),
            prisma.company.count({ where: { status: 'CHURNED' } }),
            prisma.companyActivity.count({
                where: {
                    isCompleted: false,
                    dueDate: { lte: new Date() },
                },
            }),
        ])

        return { lead, prospect, negotiation, customer, churned, pendingActivities }
    } catch (error) {
        console.error('getCrmStats error:', error)
        return { lead: 0, prospect: 0, negotiation: 0, customer: 0, churned: 0, pendingActivities: 0 }
    }
}
