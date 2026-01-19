'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

async function getClientCompanyId() {
    const session = await auth()
    const companyId = (session?.user as any)?.companyId

    // Only allow CLIENT role or if we want to allow admins to view portal (for testing)
    // But strictly speaking, portal data fetch should be scoped to companyId.

    if (!companyId) {
        // If it's an ADMIN viewing, maybe they don't have a companyId.
        // For now, strict check.
        return null
    }
    return companyId
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

export async function getClientProjects() {
    const companyId = await getClientCompanyId()
    if (!companyId) return []

    return await prisma.webProject.findMany({
        where: { companyId },
        include: { domain: true },
        orderBy: { updatedAt: 'desc' }
    })
}

export async function getClientInvoices() {
    const companyId = await getClientCompanyId()
    if (!companyId) return []

    return await prisma.invoice.findMany({
        where: { companyId },
        orderBy: { issueDate: 'desc' },
        include: { _count: { select: { payments: true } } }
    })
}

export async function getClientServices() {
    const companyId = await getClientCompanyId()
    if (!companyId) return []

    return await prisma.service.findMany({
        where: { companyId },
        orderBy: { renewDate: 'asc' }
    })
}

// Support functions (Simplified wrapper around existing actions but scoped)
export async function getClientTickets() {
    const companyId = await getClientCompanyId()
    if (!companyId) return []

    return await prisma.ticket.findMany({
        where: { companyId },
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { messages: true } } }
    })
}

export async function createClientTicket(formData: FormData) {
    const companyId = await getClientCompanyId()
    if (!companyId) return { success: false, error: 'Oturum geçersiz.' }

    try {
        const subject = formData.get('subject') as string
        const message = formData.get('message') as string
        const priority = (formData.get('priority') || 'NORMAL') as any
        const category = (formData.get('category') || 'OTHER') as any

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