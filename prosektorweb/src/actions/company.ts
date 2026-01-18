'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

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

        revalidatePath('/admin/companies')
        return { success: true, data: company }
    } catch (error: any) {
        console.error('createCompany error:', error)

        if (error instanceof z.ZodError) {
            return { success: false, error: (error as any).errors[0].message }
        }

        return { success: false, error: 'Firma oluşturulurken bir hata oluştu.' }
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
        const company = await prisma.company.findUnique({
            where: { id },
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

        revalidatePath('/admin/companies')
        revalidatePath(`/admin/companies/${id}`)
        return { success: true, data: company }
    } catch (error: any) {
        console.error('updateCompany error:', error)

        if (error instanceof z.ZodError) {
            return { success: false, error: (error as any).errors[0].message }
        }

        return { success: false, error: 'Firma güncellenirken bir hata oluştu.' }
    }
}

// ==========================================
// DELETE
// ==========================================

export async function deleteCompany(id: string): Promise<CompanyActionResult> {
    try {
        await prisma.company.delete({
            where: { id },
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
        const company = await prisma.company.findUnique({ where: { id } })
        if (!company) {
            return { success: false, error: 'Firma bulunamadı.' }
        }

        const updated = await prisma.company.update({
            where: { id },
            data: { isActive: !company.isActive },
        })

        revalidatePath('/admin/companies')
        return { success: true, data: updated }
    } catch (error) {
        console.error('toggleCompanyStatus error:', error)
        return { success: false, error: 'Durum değiştirilirken bir hata oluştu.' }
    }
}
