'use server'

import { prisma } from '@/lib/prisma'
import { getErrorMessage, getZodErrorMessage } from '@/lib/action-types'
import { requireAuth } from '@/lib/auth-guard'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

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
        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }
        return { success: false, error: 'Proje oluşturulurken hata oluştu.' }
    }
}

export async function getProjects(search?: string, status?: string) {
    try {
        const session = await auth()
        if (!session?.user) return []

        const where: any = {}

        // Tenant isolation for non-admin users
        if (session.user.role !== 'ADMIN') {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true }
            })
            if (!user?.companyId) return []
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

        const projects = await prisma.webProject.findMany({
            where,
            include: {
                company: { select: { id: true, name: true } },
                domain: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
        return projects
    } catch (error) {
        console.error('getProjects error:', error)
        return []
    }
}

export async function getProjectById(id: string) {
    try {
        const session = await auth()
        if (!session?.user) return null

        const project = await prisma.webProject.findUnique({
            where: { id },
            include: {
                company: true,
                domain: { include: { dnsRecords: true } },
            },
        })

        if (!project) return null

        // IDOR Check
        if (session.user.role !== 'ADMIN') {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true }
            })
            if (!user?.companyId || project.companyId !== user.companyId) {
                return null
            }
        }

        return project
    } catch (error) {
        console.error('getProjectById error:', error)
        return null
    }
}

export async function updateProject(id: string, formData: FormData): Promise<ProjectActionResult> {
    try {
        await requireAuth()

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

        await prisma.webProject.update({
            where: { id },
            data,
        })

        revalidatePath('/admin/projects')
        revalidatePath(`/admin/projects/${id}`)
        return { success: true }
    } catch (error) {
        console.error('updateProject error:', error)
        return { success: false, error: 'Güncelleme başarısız.' }
    }
}

export async function updateProjectStatus(id: string, status: string): Promise<ProjectActionResult> {
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

        await prisma.webProject.update({
            where: { id },
            data,
        })

        revalidatePath('/admin/projects')
        revalidatePath(`/admin/projects/${id}`)
        return { success: true }
    } catch (error) {
        console.error('updateProjectStatus error:', error)
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
