import { getProjectAnalytics, getProjectDailyStats, getTrackingScript } from '@/features/system/actions/analytics'
import { notFound } from 'next/navigation'
import AnalyticsDetailClient from '@/features/analytics/components/AnalyticsDetailClient'

export default async function AnalyticsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = await getProjectAnalytics(id)
    const dailyStats = await getProjectDailyStats(id)
    const trackingCode = await getTrackingScript(id)

    if (!project) {
        notFound()
    }

    const projectData = project ? {
        ...project,
        siteUrl: project.siteUrl ?? undefined,
        previewUrl: project.previewUrl ?? undefined,
        analytics: (project.analytics as any) ?? undefined
    } : null

    return <AnalyticsDetailClient project={projectData} dailyStats={dailyStats} trackingCode={trackingCode} />
}
