'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { DangerClass } from '@prisma/client'

// ==========================================
// TYPES & SCHEMAS
// ==========================================

const WorkplaceSchema = z.object({
    title: z.string().min(2, 'İşyeri/Şantiye adı en az 2 karakter olmalı'),
    companyId: z.string().min(1, 'Firma seçimi zorunlu'),
    sgkId: z.string().optional(),
    dangerClass: z.nativeEnum(DangerClass),
    naceCode: z.string().optional(),
    province: z.string().optional(),
    district: z.string().optional(),
    address: z.string().optional(),
})

export interface WorkplaceActionResult {
    success: boolean
    data?: any
    error?: string
}

// ==========================================
// ACTIONS
// ==========================================

export async function createWorkplace(formData: FormData): Promise<WorkplaceActionResult> {
    try {
        const rawData = {
            title: formData.get('title') as string,
            companyId: formData.get('companyId') as string,
            sgkId: formData.get('sgkId') as string || undefined,
            dangerClass: formData.get('dangerClass') as DangerClass,
            naceCode: formData.get('naceCode') as string || undefined,
            province: formData.get('province') as string || undefined,
            district: formData.get('district') as string || undefined,
            address: formData.get('address') as string || undefined,
        }

        const validated = WorkplaceSchema.parse(rawData)

        const workplace = await prisma.workplace.create({
            data: validated,
        })

        revalidatePath('/admin/workplaces')
        return { success: true, data: workplace }
    } catch (error: any) {
        console.error('createWorkplace error:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message }
        }
        return { success: false, error: 'İşyeri oluşturulurken hata oluştu.' }
    }
}

export async function updateWorkplace(id: string, formData: FormData): Promise<WorkplaceActionResult> {
    try {
        const rawData = {
            title: formData.get('title') as string,
            companyId: formData.get('companyId') as string,
            sgkId: formData.get('sgkId') as string || undefined,
            dangerClass: formData.get('dangerClass') as DangerClass,
            naceCode: formData.get('naceCode') as string || undefined,
            province: formData.get('province') as string || undefined,
            district: formData.get('district') as string || undefined,
            address: formData.get('address') as string || undefined,
        }

        const validated = WorkplaceSchema.parse(rawData)

        await prisma.workplace.update({
            where: { id },
            data: validated,
        })

        revalidatePath('/admin/workplaces')
        revalidatePath(`/admin/workplaces/${id}`)
        return { success: true }
    } catch (error: any) {
        console.error('updateWorkplace error:', error)
        return { success: false, error: 'Güncelleme başarısız.' }
    }
}

export async function deleteWorkplace(id: string): Promise<WorkplaceActionResult> {
    try {
        await prisma.workplace.delete({ where: { id } })
        revalidatePath('/admin/workplaces')
        return { success: true }
    } catch (error) {
        console.error('deleteWorkplace error:', error)
        return { success: false, error: 'Silme işlemi başarısız.' }
    }
}

// ==========================================
// QUERIES
// ==========================================

export async function getWorkplaces(search?: string) {
    try {
        const where: any = {}

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { sgkId: { contains: search } },
                { company: { name: { contains: search } } },
            ]
        }

        const workplaces = await prisma.workplace.findMany({
            where,
            include: {
                company: { select: { id: true, name: true } },
                _count: { select: { employees: true } }
            },
            orderBy: { createdAt: 'desc' },
        })
        return workplaces
    } catch (error) {
        console.error('getWorkplaces error:', error)
        return []
    }
}

export async function getWorkplaceById(id: string) {
    try {
        const workplace = await prisma.workplace.findUnique({
            where: { id },
            include: {
                company: true,
                employees: true,
            },
        })
        return workplace
    } catch (error) {
        console.error('getWorkplaceById error:', error)
        return null
    }
}
