'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { getErrorMessage, getZodErrorMessage } from '@/lib/action-types'
import { z } from 'zod'
import { AuditAction, DangerClass } from '@prisma/client'

export interface WorkplaceInput {
    companyId: string
    title: string
    sgkId?: string
    dangerClass: DangerClass
    naceCode?: string
    province?: string
    district?: string
    address?: string
}

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

export interface ActionResult {
    success: boolean
    error?: string
    data?: any
}

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

export async function getWorkplaces(page: number = 1, limit: number = 20, search?: string) {
    try {
        const skip = (page - 1) * limit
        const session = await auth()

        // Build filters
        const where: any = {}
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { sgkId: { contains: search } },
                { company: { name: { contains: search } } }
            ]
        }

        const [data, total] = await Promise.all([
            prisma.workplace.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    company: { select: { id: true, name: true } },
                    _count: { select: { employees: true } }
                }
            }),
            prisma.workplace.count({ where })
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
    } catch (e) {
        console.error('getWorkplaces Error:', e)
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }
    }
}

export async function getWorkplace(id: string) {
    try {
        return await prisma.workplace.findUnique({
            where: { id },
            include: {
                company: true,
                employees: true,
                _count: { select: { employees: true } }
            }
        })
    } catch (e) {
        return null
    }
}

export async function createWorkplace(input: WorkplaceInput | FormData): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

        const rawData = input instanceof FormData ? {
            companyId: input.get('companyId') as string,
            title: input.get('title') as string,
            sgkId: input.get('sgkId') as string || undefined,
            dangerClass: input.get('dangerClass') as DangerClass,
            naceCode: input.get('naceCode') as string || undefined,
            province: input.get('province') as string || undefined,
            district: input.get('district') as string || undefined,
            address: input.get('address') as string || undefined,
        } : input

        const validated = WorkplaceSchema.parse(rawData)

        const workplace = await prisma.workplace.create({
            data: {
                ...validated,
                isActive: true
            }
        })

        await logActivity('CREATE', 'Workplace', workplace.id, { title: workplace.title })
        revalidatePath('/admin/workplaces')
        revalidatePath(`/admin/companies/${validated.companyId}`)
        return { success: true, data: workplace }
    } catch (e: any) {
        if (e instanceof z.ZodError) return { success: false, error: getZodErrorMessage(e) }
        return { success: false, error: 'İşyeri oluşturulamadı' }
    }
}

export async function updateWorkplace(id: string, input: Partial<WorkplaceInput> | FormData): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' }
        }

        const data = input instanceof FormData ? {
            title: input.get('title') as string,
            sgkId: input.get('sgkId') as string,
            dangerClass: input.get('dangerClass') as DangerClass,
            naceCode: input.get('naceCode') as string,
            province: input.get('province') as string,
            district: input.get('district') as string,
            address: input.get('address') as string,
        } : input

        const workplace = await prisma.workplace.update({
            where: { id },
            data
        })

        await logActivity('UPDATE', 'Workplace', workplace.id, data)
        revalidatePath('/admin/workplaces')
        // revalidatePath(`/admin/workplaces/${id}`) // If we had a detail page
        return { success: true, data: workplace }
    } catch (e) {
        return { success: false, error: 'Güncelleme başarısız' }
    }
}

export async function deleteWorkplace(id: string): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' }
        }

        await prisma.workplace.delete({ where: { id } }) // Hard delete for now, assuming cascade or logic
        // Or Soft delete if schema supported it (Workplace doesn't have deletedAt in schema I saw earlier, wait let me check schema)

        await logActivity('DELETE', 'Workplace', id)
        revalidatePath('/admin/workplaces')
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Silme işlemi başarısız' }
    }
}
