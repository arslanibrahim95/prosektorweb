'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'

export async function getRevenueData() {
    await requireAuth(['ADMIN'])
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const invoices = await prisma.invoice.findMany({
        where: {
            createdAt: { gte: sixMonthsAgo },
            status: 'PAID'
        },
        select: {
            total: true,
            createdAt: true
        }
    })

    // Group by month
    const monthlyData: Record<string, number> = {}
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

    for (let i = 0; i <= 5; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
        monthlyData[key] = 0
    }

    invoices.forEach(inv => {
        const d = new Date(inv.createdAt)
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
        if (monthlyData[key] !== undefined) {
            monthlyData[key] += Number(inv.total)
        }
    })

    return Object.entries(monthlyData)
        .map(([name, value]) => ({ name, value }))
        .reverse()
}

export async function getProjectStats() {
    await requireAuth(['ADMIN'])
    const [draft, designing, development, review, live, paused] = await Promise.all([
        prisma.webProject.count({ where: { status: 'DRAFT' } }),
        prisma.webProject.count({ where: { status: 'DESIGNING' } }),
        prisma.webProject.count({ where: { status: 'DEVELOPMENT' } }),
        prisma.webProject.count({ where: { status: 'REVIEW' } }),
        prisma.webProject.count({ where: { status: 'LIVE' } }),
        prisma.webProject.count({ where: { status: 'PAUSED' } })
    ])

    return [
        { name: 'Taslak', value: draft, color: '#9ca3af' },
        { name: 'Tasarım', value: designing, color: '#f59e0b' },
        { name: 'Geliştirme', value: development, color: '#3b82f6' },
        { name: 'İnceleme', value: review, color: '#8b5cf6' },
        { name: 'Yayında', value: live, color: '#22c55e' },
        { name: 'Durduruldu', value: paused, color: '#6b7280' }
    ].filter(s => s.value > 0)
}

export async function getInvoiceStats() {
    await requireAuth(['ADMIN'])
    const [total, paid, pending, overdue] = await Promise.all([
        prisma.invoice.aggregate({ _sum: { total: true } }),
        prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { total: true } }),
        prisma.invoice.aggregate({ where: { status: 'PENDING' }, _sum: { total: true } }),
        prisma.invoice.aggregate({
            where: {
                status: 'PENDING',
                dueDate: { lt: new Date() }
            },
            _sum: { total: true }
        })
    ])

    return {
        total: Number(total._sum.total || 0),
        paid: Number(paid._sum.total || 0),
        pending: Number(pending._sum.total || 0),
        overdue: Number(overdue._sum.total || 0)
    }
}

export async function getTicketStats() {
    await requireAuth(['ADMIN'])
    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    const [open, resolved, thisMonthCount] = await Promise.all([
        prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
        prisma.ticket.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } }),
        prisma.ticket.count({ where: { createdAt: { gte: thisMonth } } })
    ])

    return { open, resolved, thisMonth: thisMonthCount }
}
