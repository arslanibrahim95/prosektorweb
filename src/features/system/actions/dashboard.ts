/**
 * @file src/features/system/actions/dashboard.ts
 * @description Data aggregation for the Admin Dashboard.
 * @invariants HEAVILY CACHED. Real-time data is not guaranteed here (5m TTL).
 * @dependencies Redis Cache, Prisma
 */
'use server'

import { prisma } from '@/server/db'
import { getOrSet } from '@/shared/lib'

export interface DashboardStats {
    companies: number
    workplaces: number
    employees: number
    users: number

    // Financials
    totalRevenue: number
    outstandingReceivables: number
    mrr: number // Monthly Recurring Revenue estimate
    chartData: { name: string, revenue: number, receivables: number }[]

    // Operations
    activeTickets: number
    pendingProjects: number // Designing + Development
    activeServices: number

    // Messages
    unreadMessages: number
    totalMessages: number
    blogPosts: number

    error: boolean
}

export interface RecentActivity {
    id: string
    action: string // CREATE, UPDATE, DELETE, LOGIN
    entity: string // Company, User, Invoice
    details: any
    userEmail: string | null
    createdAt: Date
}

// Cache wrapper with explicit redis control
export async function getAdminDashboardStats(): Promise<DashboardStats> {
    const { requireAuth } = await import('@/features/auth/lib/auth-guard')
    await requireAuth(['ADMIN'])

    return getOrSet(
        'dashboard:admin:stats',
        async () => {
            try {
                const [
                    companies,
                    workplaces,
                    employees,
                    users,
                    unreadMessages,
                    totalMessages,
                    blogPosts,
                    activeTickets,
                    pendingProjects,
                    activeServices,
                    paidInvoices,
                    pendingInvoices,
                    services,
                    // Monthly Revenue
                    monthlyStats
                ] = await Promise.all([
                    prisma.company.count(),
                    prisma.workplace.count(),
                    prisma.employee.count(),
                    prisma.user.count(),
                    prisma.contactMessage.count({ where: { read: false } }),
                    prisma.contactMessage.count(),
                    prisma.blogPost.count(),
                    prisma.ticket.count({ where: { status: { not: 'CLOSED' } } }),
                    prisma.webProject.count({ where: { status: { in: ['DESIGNING', 'DEVELOPMENT', 'REVIEW'] } } }),
                    prisma.service.count({ where: { status: 'ACTIVE' } }),

                    // Financials
                    prisma.invoice.aggregate({
                        where: { status: { in: ['PAID', 'PARTIAL'] } },
                        _sum: { paidAmount: true }
                    }),
                    prisma.invoice.aggregate({
                        where: { status: 'PENDING' },
                        _sum: { total: true }
                    }),
                    prisma.service.findMany({
                        where: { status: 'ACTIVE' },
                        select: { price: true, billingCycle: true }
                    }),
                    // Last 6 months simplified
                    prisma.invoice.findMany({
                        where: {
                            createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
                            status: { not: 'CANCELLED' }
                        },
                        select: { total: true, paidAmount: true, createdAt: true, status: true }
                    })
                ])

                // Calculate MRR
                let mrr = 0
                services.forEach(s => {
                    const price = Number(s.price)
                    if (s.billingCycle === 'MONTHLY') mrr += price
                    else if (s.billingCycle === 'YEARLY') mrr += price / 12
                })

                // Simple Month Aggregation for Chart
                const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
                const chartDataMap: Record<string, { revenue: number, receivables: number }> = {}

                // Initialize last 6 months
                for (let i = 5; i >= 0; i--) {
                    const d = new Date()
                    d.setMonth(d.getMonth() - i)
                    const label = months[d.getMonth()]
                    chartDataMap[label] = { revenue: 0, receivables: 0 }
                }

                monthlyStats.forEach(inv => {
                    const label = months[inv.createdAt.getMonth()]
                    if (chartDataMap[label]) {
                        if (inv.status === 'PAID' || inv.status === 'PARTIAL') {
                            chartDataMap[label].revenue += Number(inv.paidAmount)
                        } else if (inv.status === 'PENDING') {
                            chartDataMap[label].receivables += Number(inv.total)
                        }
                    }
                })

                const chartData = Object.entries(chartDataMap).map(([name, vals]) => ({
                    name,
                    ...vals
                }))

                return {
                    companies,
                    workplaces,
                    employees,
                    users,
                    unreadMessages,
                    totalMessages,
                    blogPosts,
                    activeTickets,
                    pendingProjects,
                    activeServices,
                    totalRevenue: Number(paidInvoices._sum.paidAmount || 0),
                    outstandingReceivables: Number(pendingInvoices._sum.total || 0),
                    mrr,
                    chartData,
                    error: false
                }
            } catch (e) {
                console.error("Dashboard Stats Error:", e)
                return {
                    companies: 0, workplaces: 0, employees: 0, users: 0,
                    unreadMessages: 0, totalMessages: 0, blogPosts: 0,
                    activeTickets: 0, pendingProjects: 0, activeServices: 0,
                    totalRevenue: 0, outstandingReceivables: 0, mrr: 0,
                    chartData: [],
                    error: true
                }
            }
        },
        { ttl: 300 } // 5 minutes cache
    )
}

export async function getRecentActivities(limit: number = 5): Promise<RecentActivity[]> {
    try {
        const { requireAuth } = await import('@/features/auth/lib/auth-guard')
        await requireAuth(['ADMIN'])

        const logs = await prisma.auditLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                action: true,
                entity: true,
                details: true,
                userEmail: true,
                createdAt: true
            }
        })

        return logs.map(log => ({
            ...log,
            action: String(log.action), // Enum to string
        }))
    } catch (e) {
        console.error("Recent Activity Error:", e)
        return []
    }
}
