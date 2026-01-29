'use server'

import { prisma } from '@/server/db'
import { auth } from '@/auth'
import { TicketPriority, TicketCategory } from '@prisma/client'
import { validatePagination } from '@/shared/lib'
import { getCookie } from '@/shared/lib/headers'

async function getClientCompanyId(): Promise<string | null> {
    const session = await auth()
    const user = session?.user

    // 1. If user is CLIENT, strict check
    if (user?.role === 'CLIENT') {
        return user.companyId
    }

    // 2. If user is ADMIN, check for impersonation cookie
    if (user?.role === 'ADMIN') {
        const impersonatingId = await getCookie('admin_view_company_id')

        // If admin selected a company to view
        if (impersonatingId) {
            return impersonatingId
        }

        // If admin just went to /portal without selecting (shouldn't happen ideally, but return null or handle)
        return null
    }

    // Default
    return null
}

export async function getClientDashboardStats() {
    const companyId = await getClientCompanyId()
    if (!companyId) return null

    try {
        const [activeProjects, openTickets, unpaidInvoices] = await Promise.all([
            prisma.webProject.count({
                where: { companyId, status: { not: 'CANCELLED' } }
            }),
            prisma.ticket.count({
                where: { companyId, status: { not: 'CLOSED' } }
            }),
            prisma.invoice.aggregate({
                where: { companyId, status: { not: 'PAID' } },
                _sum: { total: true }
            })
        ])

        return {
            activeProjects,
            openTickets,
            unpaidAmount: unpaidInvoices._sum.total || 0
        }
    } catch (error) {
        return null
    }
}

export async function getClientProjects(page = 1, limit = 10) {
    const companyId = await getClientCompanyId()
    if (!companyId) return { data: [], total: 0, pages: 0, currentPage: 1 }

    const { skip, limit: validatedLimit } = validatePagination(page, limit)

    const [data, total] = await Promise.all([
        prisma.webProject.findMany({
            where: { companyId },
            include: { domain: true },
            orderBy: { updatedAt: 'desc' },
            skip,
            take: validatedLimit
        }),
        prisma.webProject.count({ where: { companyId } })
    ])

    return {
        data,
        total,
        pages: Math.ceil(total / validatedLimit),
        currentPage: page
    }
}

export async function getClientInvoices(page = 1, limit = 10) {
    const companyId = await getClientCompanyId()
    if (!companyId) return { data: [], total: 0, pages: 0, currentPage: 1 }

    const { skip, limit: validatedLimit } = validatePagination(page, limit)

    const [data, total] = await Promise.all([
        prisma.invoice.findMany({
            where: { companyId },
            orderBy: { issueDate: 'desc' },
            include: { _count: { select: { payments: true } } },
            skip,
            take: validatedLimit
        }),
        prisma.invoice.count({ where: { companyId } })
    ])

    return {
        data,
        total,
        pages: Math.ceil(total / validatedLimit),
        currentPage: page
    }
}

export async function getClientServices(page = 1, limit = 10) {
    const companyId = await getClientCompanyId()
    if (!companyId) return { data: [], total: 0, pages: 0, currentPage: 1 }

    const { skip, limit: validatedLimit } = validatePagination(page, limit)

    const [data, total] = await Promise.all([
        prisma.service.findMany({
            where: { companyId },
            orderBy: { renewDate: 'asc' },
            skip,
            take: validatedLimit
        }),
        prisma.service.count({ where: { companyId } })
    ])

    return {
        data,
        total,
        pages: Math.ceil(total / validatedLimit),
        currentPage: page
    }
}

// Support functions (Simplified wrapper around existing actions but scoped)
export async function getClientTickets(page = 1, limit = 10) {
    const companyId = await getClientCompanyId()
    if (!companyId) return { data: [], total: 0, pages: 0, currentPage: 1 }

    const { skip, limit: validatedLimit } = validatePagination(page, limit)

    const [data, total] = await Promise.all([
        prisma.ticket.findMany({
            where: { companyId },
            orderBy: { updatedAt: 'desc' },
            include: { _count: { select: { messages: true } } },
            skip,
            take: validatedLimit
        }),
        prisma.ticket.count({ where: { companyId } })
    ])

    return {
        data,
        total,
        pages: Math.ceil(total / validatedLimit),
        currentPage: page
    }
}

export async function createClientTicket(formData: FormData) {
    const companyId = await getClientCompanyId()
    if (!companyId) return { success: false, error: 'Oturum geçersiz.' }

    try {
        const subject = formData.get('subject') as string
        const message = formData.get('message') as string
        const priorityStr = (formData.get('priority') as string) || 'NORMAL'
        const categoryStr = (formData.get('category') as string) || 'OTHER'

        // Validate enum values
        const validPriorities: TicketPriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT']
        const validCategories: TicketCategory[] = ['WEB_DESIGN', 'SEO', 'ADS', 'HOSTING', 'OTHER']

        const priority: TicketPriority = validPriorities.includes(priorityStr as TicketPriority)
            ? (priorityStr as TicketPriority)
            : 'NORMAL'
        const category: TicketCategory = validCategories.includes(categoryStr as TicketCategory)
            ? (categoryStr as TicketCategory)
            : 'OTHER'

        if (!subject || !message) {
            return { success: false, error: 'Konu ve mesaj alanları zorunludur.' }
        }

        const ticket = await prisma.ticket.create({
            data: {
                companyId,
                subject,
                priority,
                category,
                status: 'OPEN',
                messages: {
                    create: {
                        content: message,
                        isStaffReply: false
                    }
                }
            }
        })

        return { success: true, data: ticket }
    } catch (error) {
        console.error('createClientTicket error:', error)
        return { success: false, error: 'Talep oluşturulurken hata oluştu.' }
    }
}

// Get single project by ID (with security check)
export async function getProjectById(projectId: string) {
    const companyId = await getClientCompanyId()
    if (!companyId) return null

    return await prisma.webProject.findFirst({
        where: {
            id: projectId,
            companyId // Security: only their own projects
        },
        include: {
            domain: true,
            company: {
                select: { name: true }
            },
            generatedContents: {
                orderBy: { contentType: 'asc' }
            }
        }
    })
}

// Get single invoice by ID (with security check)
export async function getInvoiceById(invoiceId: string) {
    const companyId = await getClientCompanyId()
    if (!companyId) return null

    return await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            companyId
        },
        include: {
            payments: {
                orderBy: { paymentDate: 'desc' }
            },
            company: {
                select: { name: true }
            }
        }
    })
}

// Get company profile
export async function getClientProfile() {
    const companyId = await getClientCompanyId()
    if (!companyId) return null

    return await prisma.company.findUnique({
        where: { id: companyId },
        include: {
            contacts: true
        }
    })
}