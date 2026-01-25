'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { getErrorMessage, getZodErrorMessage, validatePagination } from '@/lib/action-types'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
    getUserCompanyId,
    requireTenantAccess,
    requireCompanyAccess,
    TenantAccessError,
    UnauthorizedError
} from '@/lib/guards/tenant-guard'

// ==========================================
// TYPES
// ==========================================

export interface ProjectActionResult {
    success: boolean
    data?: any
    error?: string
}

// ==========================================
// PROJECT CRUD
// ==========================================

const ProjectSchema = z.object({
    name: z.string().min(3, 'Proje adı en az 3 karakter olmalı'),
    companyId: z.string().min(1, 'Firma seçimi zorunlu'),
    domainId: z.string().optional(),
    price: z.string().optional(),
    notes: z.string().optional(),
})

export async function createProject(formData: FormData): Promise<ProjectActionResult> {
    try {
        await requireAuth()

        const rawData = {
            name: formData.get('name') as string,
            companyId: formData.get('companyId') as string,
            domainId: formData.get('domainId') as string || undefined,
            price: formData.get('price') as string || undefined,
            notes: formData.get('notes') as string || undefined,
        }

        const validated = ProjectSchema.parse(rawData)

        // Tenant isolation: verify user can create projects for this company
        await requireCompanyAccess(validated.companyId)

        const project = await prisma.webProject.create({
            data: {
                name: validated.name,
                companyId: validated.companyId,
                domainId: validated.domainId || null,
                price: validated.price ? parseFloat(validated.price) : null,
                notes: validated.notes || null,
                status: 'DRAFT',
            },
        })

        revalidatePath('/admin/projects')
        return { success: true, data: project }
    } catch (error: unknown) {
        console.error('createProject error:', error)
        if (error instanceof TenantAccessError || error instanceof UnauthorizedError) {
            return { success: false, error: error.message }
        }
        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }
        return { success: false, error: 'Proje oluşturulurken hata oluştu.' }
    }
}

export async function getProjects(
    options?: {
        search?: string
        status?: string
        page?: number
        limit?: number
    }
) {
    const { search = '', status = '' } = options || {}
    const { page, limit, skip } = validatePagination(options?.page, options?.limit)

    try {
        const session = await auth()
        if (!session?.user) return { data: [], total: 0, pages: 0, currentPage: 1 }

        const where: any = {}

        // Tenant isolation for non-admin users
        if (session.user.role !== 'ADMIN') {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true }
            })
            if (!user?.companyId) return { data: [], total: 0, pages: 0, currentPage: 1 }
            where.companyId = user.companyId
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { company: { name: { contains: search } } },
            ]
        }

        if (status && status !== 'ALL') {
            where.status = status
        }

        const [projects, total] = await Promise.all([
            prisma.webProject.findMany({
                where,
                skip,
                take: limit,
                include: {
                    company: { select: { id: true, name: true } },
                    domain: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.webProject.count({ where })
        ])

        return {
            data: projects,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        }
    } catch (error) {
        console.error('getProjects error:', error)
        return { data: [], total: 0, pages: 0, currentPage: 1 }
    }
}

export async function getProjectById(id: string) {
    try {
        const session = await auth()
        if (!session?.user) return null

        const userCompanyId = await getUserCompanyId(session.user.id, session.user.role as 'ADMIN' | 'CLIENT')
        if (session.user.role !== 'ADMIN' && !userCompanyId) return null

        const project = await prisma.webProject.findFirst({
            where: {
                id,
                companyId: session.user.role === 'ADMIN' ? undefined : userCompanyId!,
            },
            include: {
                company: true,
                domain: { include: { dnsRecords: true } },
                generatedContents: {
                    where: { status: 'APPROVED' },
                },
            },
        })

        return project
    } catch (error) {
        console.error('getProjectById error:', error)
        return null
    }
}

export async function updateProject(id: string, formData: FormData, version?: number): Promise<ProjectActionResult> {
    try {
        await requireAuth()

        // Tenant isolation: verify user can access this project
        await requireTenantAccess('project', id)

        const data: any = {}

        const name = formData.get('name') as string
        const status = formData.get('status') as string
        const domainId = formData.get('domainId') as string
        const price = formData.get('price') as string
        const siteUrl = formData.get('siteUrl') as string
        const previewUrl = formData.get('previewUrl') as string
        const repoUrl = formData.get('repoUrl') as string
        const notes = formData.get('notes') as string
        const isPaid = formData.get('isPaid')

        if (name) data.name = name
        if (status) data.status = status
        if (domainId !== undefined) data.domainId = domainId || null
        if (price !== undefined) data.price = price ? parseFloat(price) : null
        if (siteUrl !== undefined) data.siteUrl = siteUrl || null
        if (previewUrl !== undefined) data.previewUrl = previewUrl || null
        if (repoUrl !== undefined) data.repoUrl = repoUrl || null
        if (notes !== undefined) data.notes = notes || null
        if (isPaid !== null) data.isPaid = isPaid === 'on'

        // Auto-set dates based on status
        if (status === 'DESIGNING' || status === 'DEVELOPMENT') {
            const existing = await prisma.webProject.findUnique({ where: { id } })
            if (!existing?.startedAt) {
                data.startedAt = new Date()
            }
        }
        if (status === 'LIVE') {
            data.completedAt = new Date()
        }
        if (isPaid === 'on') {
            const existing = await prisma.webProject.findUnique({ where: { id } })
            if (!existing?.paidAt) {
                data.paidAt = new Date()
            }
        }

        const where: any = { id }
        if (typeof version === 'number') {
            where.version = version
            data.version = { increment: 1 }
        }

        await prisma.webProject.update({
            where,
            data,
        })

        revalidatePath('/admin/projects')
        revalidatePath(`/admin/projects/${id}`)
        return { success: true }
    } catch (error) {
        console.error('updateProject error:', error)
        if ((error as any).code === 'P2025') {
            return { success: false, error: 'Kayıt başka bir kullanıcı tarafından değiştirilmiş. Lütfen sayfayı yenileyiniz.' }
        }
        return { success: false, error: 'Güncelleme başarısız.' }
    }
}

export async function updateProjectStatus(id: string, status: string, version?: number): Promise<ProjectActionResult> {
    try {
        await requireAuth()

        const data: any = { status }

        // Auto-set dates
        if (status === 'DESIGNING' || status === 'DEVELOPMENT') {
            const existing = await prisma.webProject.findUnique({ where: { id } })
            if (!existing?.startedAt) {
                data.startedAt = new Date()
            }
        }
        if (status === 'LIVE') {
            data.completedAt = new Date()
        }

        const where: any = { id }
        if (typeof version === 'number') {
            where.version = version
            data.version = { increment: 1 }
        }

        await prisma.webProject.update({
            where,
            data,
        })

        revalidatePath('/admin/projects')
        revalidatePath(`/admin/projects/${id}`)
        return { success: true }
    } catch (error) {
        console.error('updateProjectStatus error:', error)
        if ((error as any).code === 'P2025') {
            return { success: false, error: 'Kayıt başka bir kullanıcı tarafından değiştirilmiş. Lütfen sayfayı yenileyiniz.' }
        }
        return { success: false, error: 'Durum güncellenemedi.' }
    }
}

export async function deleteProject(id: string): Promise<ProjectActionResult> {
    try {
        await requireAuth()

        await prisma.webProject.delete({ where: { id } })
        revalidatePath('/admin/projects')
        return { success: true }
    } catch (error) {
        console.error('deleteProject error:', error)
        return { success: false, error: 'Silme başarısız.' }
    }
}

// ==========================================
// STATS
// ==========================================

export async function getProjectStats() {
    try {
        await requireAuth(['ADMIN'])
        const [
            total,
            draft,
            inProgress,
            review,
            live,
            totalRevenue,
            pendingPayment,
        ] = await Promise.all([
            prisma.webProject.count(),
            prisma.webProject.count({ where: { status: 'DRAFT' } }),
            prisma.webProject.count({ where: { status: { in: ['DESIGNING', 'DEVELOPMENT', 'DEPLOYING'] } } }),
            prisma.webProject.count({ where: { status: 'REVIEW' } }),
            prisma.webProject.count({ where: { status: 'LIVE' } }),
            prisma.webProject.aggregate({
                where: { isPaid: true },
                _sum: { price: true },
            }),
            prisma.webProject.aggregate({
                where: { isPaid: false, price: { not: null } },
                _sum: { price: true },
            }),
        ])

        return {
            total,
            draft,
            inProgress,
            review,
            live,
            totalRevenue: totalRevenue._sum.price?.toNumber() || 0,
            pendingPayment: pendingPayment._sum.price?.toNumber() || 0,
        }
    } catch (error) {
        console.error('getProjectStats error:', error)
        return { total: 0, draft: 0, inProgress: 0, review: 0, live: 0, totalRevenue: 0, pendingPayment: 0 }
    }
}
