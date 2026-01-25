'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getUserCompanyId } from '@/lib/guards/tenant-guard'
import { logAudit } from '@/lib/audit'
import { getErrorMessage, getZodErrorMessage, validatePagination } from '@/lib/action-types'
import { z } from 'zod'
import { AuditAction, CompanyStatus } from '@prisma/client'

// Common types
export interface CompanyInput {
    name: string
    title?: string
    taxNo?: string
    taxOffice?: string
    address?: string
    phone?: string
    email?: string
    logo?: string
}

// Validation Schema
const CompanySchema = z.object({
    name: z.string().min(2, 'Firma adı en az 2 karakter olmalı'),
    title: z.string().optional().or(z.literal('')),
    taxNo: z.string().optional().or(z.literal('')),
    taxOffice: z.string().optional().or(z.literal('')),
    email: z.string().email('Geçerli bir e-posta girin').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
})

export interface ActionResult {
    success: boolean
    error?: string
    data?: any
}

/**
 * Audit Log Helper
 */
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

/**
 * Get all companies with pagination & filtering
 */
export async function getCompanies(page: number = 1, limit: number = 20, search?: string) {
    try {
        const skip = (page - 1) * limit
        const where: any = {
            deletedAt: null // Soft delete check
        }

        if (search) {
            where.OR = [
                { name: { contains: search } }, // Case insensitive in standard Prisma depends on DB collation
                { taxNo: { contains: search } },
                { email: { contains: search } }
            ]
        }

        const [data, total] = await Promise.all([
            prisma.company.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { workplaces: true, users: true }
                    }
                }
            }),
            prisma.company.count({ where })
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
        console.error('getCompanies Error:', e)
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }
    }
}

/**
 * Get single company
 */
export async function getCompany(id: string) {
    try {
        return await prisma.company.findUnique({
            where: { id },
            include: {
                workplaces: {
                    include: {
                        _count: { select: { employees: true } }
                    }
                },
                notes: {
                    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
                },
                contacts: {
                    orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
                },
                activities: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
                webProjects: true,
                users: true,
                _count: { select: { invoices: true } }
            }
        })
    } catch (e) {
        return null
    }
}

/**
 * Create Company
 */
export async function createCompany(input: CompanyInput | FormData): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' }
        }

        const rawData = input instanceof FormData ? {
            name: input.get('name') as string,
            title: input.get('title') as string || '',
            taxNo: input.get('taxNo') as string || '',
            taxOffice: input.get('taxOffice') as string || '',
            address: input.get('address') as string || '',
            phone: input.get('phone') as string || '',
            email: input.get('email') as string || '',
        } : input

        const validated = CompanySchema.parse(rawData)

        const company = await prisma.company.create({
            data: {
                ...validated,
                isActive: true
            }
        })

        await logActivity('CREATE', 'Company', company.id, { name: company.name })
        revalidatePath('/admin/companies')
        return { success: true, data: company }
    } catch (e) {
        console.error('createCompany Error:', e)
        return { success: false, error: 'Firma oluşturulamadı' }
    }
}

/**
 * Update Company
 */
export async function updateCompany(id: string, input: CompanyInput | FormData): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' }
        }

        const data = input instanceof FormData ? {
            name: input.get('name') as string,
            title: input.get('title') as string,
            taxNo: input.get('taxNo') as string,
            taxOffice: input.get('taxOffice') as string,
            address: input.get('address') as string,
            phone: input.get('phone') as string,
            email: input.get('email') as string,
        } : input

        const company = await prisma.company.update({
            where: { id },
            data: {
                ...data
            }
        })

        await logActivity('UPDATE', 'Company', id, { name: company.name })
        revalidatePath('/admin/companies')
        revalidatePath(`/admin/companies/${id}`)
        return { success: true, data: company }
    } catch (e) {
        return { success: false, error: 'Güncelleme başarısız' }
    }
}

/**
 * Delete Company (Soft Delete)
 */
export async function deleteCompany(id: string): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' }
        }

        // Soft delete
        const company = await prisma.company.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false
            }
        })

        await logActivity('DELETE', 'Company', id)
        revalidatePath('/admin/companies')
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Silme işlemi başarısız' }
    }
}

export async function toggleCompanyStatus(id: string): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

        const company = await prisma.company.findUnique({ where: { id } })
        if (!company) return { success: false, error: 'Firma bulunamadı.' }

        const updated = await prisma.company.update({
            where: { id },
            data: { isActive: !company.isActive },
        })

        await logActivity('UPDATE', 'Company', id, { isActive: updated.isActive, name: company.name })
        revalidatePath('/admin/companies')
        return { success: true, data: updated }
    } catch (error) {
        console.error('toggleCompanyStatus error:', error)
        return { success: false, error: 'Durum değiştirilirken bir hata oluştu.' }
    }
}
