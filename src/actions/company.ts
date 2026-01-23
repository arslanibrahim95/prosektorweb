'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { getErrorMessage, getZodErrorMessage } from '@/lib/action-types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getUserCompanyId } from '@/lib/guards/tenant-guard'

// ==========================================
// TYPES
// ==========================================

export interface CompanyActionResult {
    success: boolean
    data?: any
    error?: string
}

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const CompanySchema = z.object({
    name: z.string().min(2, 'Firma adı en az 2 karakter olmalı'),
    taxId: z.string().optional(),
    taxOffice: z.string().optional(),
    email: z.string().email('Geçerli bir e-posta girin').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
})

// ==========================================
// CREATE
// ==========================================

export async function createCompany(formData: FormData): Promise<CompanyActionResult> {
    try {
        await requireAuth()

        const rawData = {
            name: formData.get('name') as string,
            taxId: formData.get('taxId') as string || undefined,
            taxOffice: formData.get('taxOffice') as string || undefined,
            email: formData.get('email') as string || undefined,
            phone: formData.get('phone') as string || undefined,
            address: formData.get('address') as string || undefined,
        }

        const validatedData = CompanySchema.parse(rawData)

        const company = await prisma.company.create({
            data: {
                name: validatedData.name,
                taxId: validatedData.taxId || null,
                taxOffice: validatedData.taxOffice || null,
                email: validatedData.email || null,
                phone: validatedData.phone || null,
                address: validatedData.address || null,
            },
        })

        await logAudit({
            action: 'CREATE',
            entity: 'Company',
            entityId: company.id,
            details: { name: company.name },
        })

        revalidatePath('/admin/companies')
        return { success: true, data: company }
    } catch (error: unknown) {
        console.error('createCompany error:', error)

        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }

        return { success: false, error: getErrorMessage(error) }
    }
}

// ==========================================
// READ (List)
// ==========================================

export async function getCompanies(options?: {
    search?: string
    page?: number
    limit?: number
}) {
    const { search = '', page = 1, limit = 10 } = options || {}
    const skip = (page - 1) * limit

    try {
        const session = await auth()
        if (!session?.user || session.user.role !== 'ADMIN') {
            // Only admins can list companies
            return { companies: [], total: 0, pages: 0, currentPage: 1 }
        }

        const where = search
            ? {
                OR: [
                    { name: { contains: search } },
                    { taxId: { contains: search } },
                    { email: { contains: search } },
                ],
            }
            : {}

        const [companies, total] = await Promise.all([
            prisma.company.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { workplaces: true },
                    },
                },
            }),
            prisma.company.count({ where }),
        ])

        return {
            companies,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        }
    } catch (error) {
        console.error('getCompanies error:', error)
        return { companies: [], total: 0, pages: 0, currentPage: 1 }
    }
}

// ==========================================
// READ (Single)
// ==========================================

export async function getCompanyById(id: string) {
    try {
        const session = await auth()
        if (!session?.user) return null

        const userCompanyId = await getUserCompanyId(session.user.id, session.user.role as 'ADMIN' | 'CLIENT')

        const company = await prisma.company.findFirst({
            where: {
                id,
                ...(session.user.role === 'ADMIN' ? {} : { id: userCompanyId }),
            },
            include: {
                workplaces: {
                    include: {
                        _count: {
                            select: { employees: true },
                        },
                    },
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
                _count: {
                    select: { invoices: true },
                },
            },
        })
        return company
    } catch (error) {
        console.error('getCompanyById error:', error)
        return null
    }
}

// ==========================================
// UPDATE
// ==========================================

export async function updateCompany(id: string, formData: FormData): Promise<CompanyActionResult> {
    try {
        await requireAuth()

        const rawData = {
            name: formData.get('name') as string,
            taxId: formData.get('taxId') as string || undefined,
            taxOffice: formData.get('taxOffice') as string || undefined,
            email: formData.get('email') as string || undefined,
            phone: formData.get('phone') as string || undefined,
            address: formData.get('address') as string || undefined,
        }

        const validatedData = CompanySchema.parse(rawData)

        const company = await prisma.company.update({
            where: { id },
            data: {
                name: validatedData.name,
                taxId: validatedData.taxId || null,
                taxOffice: validatedData.taxOffice || null,
                email: validatedData.email || null,
                phone: validatedData.phone || null,
                address: validatedData.address || null,
            },
        })

        await logAudit({
            action: 'UPDATE',
            entity: 'Company',
            entityId: id,
            details: { name: company.name },
        })

        revalidatePath('/admin/companies')
        revalidatePath(`/admin/companies/${id}`)
        return { success: true, data: company }
    } catch (error: unknown) {
        console.error('updateCompany error:', error)

        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }

        return { success: false, error: getErrorMessage(error) }
    }
}

// ==========================================
// DELETE
// ==========================================

export async function deleteCompany(id: string): Promise<CompanyActionResult> {
    try {
        await requireAuth()

        // Use transaction to ensure atomicity: delete + audit log together
        await prisma.$transaction(async (tx) => {
            // Get company info before delete for audit
            const company = await tx.company.findUnique({
                where: { id },
                select: { name: true },
            })

            if (!company) {
                throw new Error('Firma bulunamadı.')
            }

            await tx.company.delete({
                where: { id },
            })

            // Create audit log inside transaction
            await tx.auditLog.create({
                data: {
                    action: 'DELETE',
                    entity: 'Company',
                    entityId: id,
                    details: { name: company.name },
                },
            })
        })

        revalidatePath('/admin/companies')
        return { success: true }
    } catch (error) {
        console.error('deleteCompany error:', error)
        return { success: false, error: 'Firma silinirken bir hata oluştu.' }
    }
}

// ==========================================
// TOGGLE ACTIVE STATUS
// ==========================================

export async function toggleCompanyStatus(id: string): Promise<CompanyActionResult> {
    try {
        await requireAuth()

        const company = await prisma.company.findUnique({ where: { id } })
        if (!company) {
            return { success: false, error: 'Firma bulunamadı.' }
        }

        const updated = await prisma.company.update({
            where: { id },
            data: { isActive: !company.isActive },
        })

        await logAudit({
            action: 'UPDATE',
            entity: 'Company',
            entityId: id,
            details: { isActive: updated.isActive, name: company.name },
        })

        revalidatePath('/admin/companies')
        return { success: true, data: updated }
    } catch (error) {
        console.error('toggleCompanyStatus error:', error)
        return { success: false, error: 'Durum değiştirilirken bir hata oluştu.' }
    }
}
