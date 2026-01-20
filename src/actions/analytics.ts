'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function getClientCompanyId() {
    const session = await auth()
    return (session?.user as any)?.companyId || null
}

// Get analytics for all client's projects
export async function getClientAnalytics() {
    const companyId = await getClientCompanyId()
    if (!companyId) return []

    const projects = await prisma.webProject.findMany({
        where: { companyId, status: 'LIVE' },
        include: {
            analytics: true,
            domain: { select: { name: true } }
        }
    })

    return projects
}

// Get analytics for a specific project
export async function getProjectAnalytics(projectId: string) {
    const companyId = await getClientCompanyId()
    if (!companyId) return null

    const project = await prisma.webProject.findFirst({
        where: { id: projectId, companyId },
        include: {
            analytics: true,
            domain: { select: { name: true } }
        }
    })

    return project
}

// Get daily stats for chart (last 30 days)
export async function getProjectDailyStats(projectId: string) {
    const companyId = await getClientCompanyId()
    if (!companyId) return []

    // Verify project belongs to client
    const project = await prisma.webProject.findFirst({
        where: { id: projectId, companyId }
    })
    if (!project) return []

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const stats = await prisma.dailyStats.findMany({
        where: {
            projectId,
            date: { gte: thirtyDaysAgo }
        },
        orderBy: { date: 'asc' }
    })

    return stats
}

// Get leads for a project
export async function getProjectLeads(projectId: string, limit = 20) {
    const companyId = await getClientCompanyId()
    if (!companyId) return []

    // Verify project belongs to client
    const project = await prisma.webProject.findFirst({
        where: { id: projectId, companyId }
    })
    if (!project) return []

    const leads = await prisma.leadCapture.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: limit
    })

    return leads
}

// Get aggregated analytics summary for all projects
export async function getClientAnalyticsSummary() {
    const companyId = await getClientCompanyId()
    if (!companyId) return null

    const analytics = await prisma.siteAnalytics.findMany({
        where: {
            project: { companyId, status: 'LIVE' }
        }
    })

    if (analytics.length === 0) return null

    // Aggregate
    const summary = {
        totalVisitors: analytics.reduce((sum, a) => sum + a.totalVisitors, 0),
        totalPageViews: analytics.reduce((sum, a) => sum + a.pageViews, 0),
        avgBounceRate: analytics.reduce((sum, a) => sum + Number(a.bounceRate), 0) / analytics.length,
        avgPageSpeed: analytics.reduce((sum, a) => sum + (a.pageSpeedScore || 0), 0) / analytics.filter(a => a.pageSpeedScore).length || 0,
        projectCount: analytics.length
    }

    return summary
}

// Generate mock analytics for demo purposes
export async function generateMockAnalytics(projectId: string) {
    // Check if analytics already exist
    const existing = await prisma.siteAnalytics.findUnique({
        where: { projectId }
    })

    if (existing) return existing

    // Generate mock data
    const analytics = await prisma.siteAnalytics.create({
        data: {
            projectId,
            totalVisitors: Math.floor(Math.random() * 5000) + 500,
            uniqueVisitors: Math.floor(Math.random() * 3000) + 300,
            pageViews: Math.floor(Math.random() * 15000) + 1000,
            bounceRate: Math.random() * 40 + 30, // 30-70%
            avgSessionDuration: Math.floor(Math.random() * 180) + 60, // 60-240 seconds
            mobilePercent: Math.random() * 30 + 50, // 50-80%
            desktopPercent: Math.random() * 30 + 15, // 15-45%
            tabletPercent: Math.random() * 10 + 2, // 2-12%
            pageSpeedScore: Math.floor(Math.random() * 30) + 70, // 70-100
            mobileScore: Math.floor(Math.random() * 30) + 60, // 60-90
            seoScore: Math.floor(Math.random() * 20) + 75, // 75-95
            accessibilityScore: Math.floor(Math.random() * 15) + 80, // 80-95
            uptimePercent: 99.9,
            sslStatus: 'VALID',
            sslValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 year
            domainAuthority: Math.floor(Math.random() * 30) + 10, // 10-40
            backlinks: Math.floor(Math.random() * 200) + 20,
            indexedPages: Math.floor(Math.random() * 50) + 5,
            trafficSources: [
                { name: 'Google', percent: 55 },
                { name: 'Direkt', percent: 25 },
                { name: 'Sosyal Medya', percent: 12 },
                { name: 'Referans', percent: 8 }
            ],
            topPages: [
                { path: '/', views: Math.floor(Math.random() * 3000) + 500 },
                { path: '/hizmetler', views: Math.floor(Math.random() * 1000) + 200 },
                { path: '/hakkimizda', views: Math.floor(Math.random() * 800) + 150 },
                { path: '/iletisim', views: Math.floor(Math.random() * 600) + 100 }
            ],
            topCountries: [
                { country: 'Türkiye', percent: 85 },
                { country: 'Almanya', percent: 8 },
                { country: 'Hollanda', percent: 4 },
                { country: 'Diğer', percent: 3 }
            ]
        }
    })

    // Generate last 30 days of daily stats
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        await prisma.dailyStats.upsert({
            where: {
                projectId_date: {
                    projectId,
                    date
                }
            },
            create: {
                projectId,
                date,
                visitors: Math.floor(Math.random() * 150) + 20,
                uniqueVisitors: Math.floor(Math.random() * 100) + 15,
                pageViews: Math.floor(Math.random() * 400) + 50,
                bounceRate: Math.random() * 40 + 30,
                avgDuration: Math.floor(Math.random() * 180) + 60,
                leads: Math.floor(Math.random() * 3)
            },
            update: {}
        })
    }

    return analytics
}
