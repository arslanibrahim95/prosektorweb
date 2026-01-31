'use client'

import { useState } from 'react'
import { TrafficChart, TrafficSources, PerformanceGauge } from '@/components/portal/AnalyticsCharts'
import Link from 'next/link'
import {
    ArrowLeft, Users, Eye, Clock, TrendingDown, RefreshCw, CheckCircle,
    ExternalLink, Smartphone, Monitor, Tablet, Shield, Zap
} from 'lucide-react'

interface TrafficSource {
    name: string
    percent: number
}

interface TopPage {
    path: string
    views: number
}

interface DailyStat {
    date: Date | string
    visitors: number
    pageViews: number
}

interface Analytics {
    trafficSources?: TrafficSource[]
    topPages?: TopPage[]
    totalVisitors?: number
    pageViews?: number
    bounceRate?: number
    avgSessionDuration?: number
    mobilePercent?: number
    desktopPercent?: number
    tabletPercent?: number
    pageSpeedScore?: number
    mobileScore?: number
    seoScore?: number
    accessibilityScore?: number
    domainAuthority?: number
    backlinks?: number
    indexedPages?: number
    sslStatus?: string
    sslValidUntil?: Date | string
    uptimePercent?: number
    lastUpdated?: Date | string
}

interface Project {
    name: string
    siteUrl?: string
    previewUrl?: string
    analytics?: Analytics
}

interface AnalyticsDetailClientProps {
    project: Project | null
    dailyStats: DailyStat[]
    trackingCode?: string | null
}

export default function AnalyticsDetailClient(props: AnalyticsDetailClientProps) {
    const { project, dailyStats } = props
    const analytics = project?.analytics

    if (!project) {
        return (
            <div className="text-center py-12">
                <p className="text-neutral-500">Proje bulunamadı.</p>
            </div>
        )
    }

    // Format daily stats for chart
    const chartData = dailyStats.map((stat) => ({
        date: new Date(stat.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        visitors: stat.visitors,
        pageViews: stat.pageViews
    }))

    // Format session duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Traffic sources from JSON
    const trafficSources: TrafficSource[] = analytics?.trafficSources ?? [
        { name: 'Google', percent: 55 },
        { name: 'Direkt', percent: 25 },
        { name: 'Sosyal Medya', percent: 12 },
        { name: 'Referans', percent: 8 }
    ]

    // Top pages from JSON
    const topPages: TopPage[] = analytics?.topPages ?? []

    const [showTracking, setShowTracking] = useState(false)
    const [copied, setCopied] = useState(false)

    // ... existing ...
    const sslValid = analytics?.sslStatus === 'VALID'
    const sslExpiringSoon = analytics?.sslStatus === 'EXPIRING_SOON'

    const copyToClipboard = () => {
        if (props.trackingCode) {
            navigator.clipboard.writeText(props.trackingCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="space-y-8">
            {/* Tracking Modal */}
            {showTracking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowTracking(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold font-serif">Kurulum: Takip Kodu</h3>
                            <button onClick={() => setShowTracking(false)} className="text-neutral-400 hover:text-neutral-600">
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-neutral-600">
                                Sitenizden veri toplamak için aşağıdaki kodu <code>&lt;head&gt;</code> etiketleri arasına ekleyin.
                            </p>
                            <div className="relative group">
                                <pre className="bg-neutral-900 text-neutral-50 p-4 rounded-xl text-xs overflow-x-auto font-mono">
                                    {props.trackingCode}
                                </pre>
                                <button
                                    onClick={copyToClipboard}
                                    className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
                                >
                                    {copied ? <CheckCircle className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
                                    {copied ? 'Kopyalandı' : 'Kopyala'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Link
                        href="/portal/analytics"
                        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Tüm Siteler
                    </Link>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">{project.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        {project.siteUrl && (
                            <a
                                href={project.siteUrl}
                                target="_blank"
                                className="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-sm"
                            >
                                {project.siteUrl.replace('https://', '')}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                        {props.trackingCode && (
                            <button
                                onClick={() => setShowTracking(true)}
                                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
                            >
                                <Zap className="w-4 h-4" />
                                Kurulum
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <RefreshCw className="w-4 h-4" />
                        Son güncelleme: {analytics?.lastUpdated
                            ? new Date(analytics.lastUpdated).toLocaleDateString('tr-TR', {
                                day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                            })
                            : '-'
                        }
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-neutral-200">
                    <div className="flex items-center gap-2 text-neutral-500 mb-2">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-medium">Toplam Ziyaretçi</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                        {(analytics?.totalVisitors || 0).toLocaleString('tr-TR')}
                    </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-neutral-200">
                    <div className="flex items-center gap-2 text-neutral-500 mb-2">
                        <Eye className="w-4 h-4" />
                        <span className="text-xs font-medium">Sayfa Görüntüleme</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                        {(analytics?.pageViews || 0).toLocaleString('tr-TR')}
                    </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-neutral-200">
                    <div className="flex items-center gap-2 text-neutral-500 mb-2">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-medium">Hemen Çıkma</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                        %{Number(analytics?.bounceRate || 0).toFixed(1)}
                    </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-neutral-200">
                    <div className="flex items-center gap-2 text-neutral-500 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">Ort. Oturum Süresi</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                        {formatDuration(analytics?.avgSessionDuration || 0)}
                    </p>
                </div>
            </div>

            {/* Traffic Chart */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-6">Ziyaretçi Trendi (Son 30 Gün)</h2>
                {chartData.length > 0 ? (
                    <TrafficChart data={chartData} />
                ) : (
                    <div className="text-center py-12 text-neutral-500">
                        Henüz yeterli veri yok
                    </div>
                )}
            </div>

            {/* Grid: Device, Sources, Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Device Distribution */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4">Cihaz Dağılımı</h2>
                    <div className="flex items-center justify-around mb-4">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mx-auto mb-2">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <p className="text-lg font-bold">%{Number(analytics?.mobilePercent || 0).toFixed(0)}</p>
                            <p className="text-xs text-neutral-500">Mobil</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-2">
                                <Monitor className="w-6 h-6" />
                            </div>
                            <p className="text-lg font-bold">%{Number(analytics?.desktopPercent || 0).toFixed(0)}</p>
                            <p className="text-xs text-neutral-500">Masaüstü</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mx-auto mb-2">
                                <Tablet className="w-6 h-6" />
                            </div>
                            <p className="text-lg font-bold">%{Number(analytics?.tabletPercent || 0).toFixed(0)}</p>
                            <p className="text-xs text-neutral-500">Tablet</p>
                        </div>
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4">Trafik Kaynakları</h2>
                    <TrafficSources sources={trafficSources} />
                </div>

                {/* Performance Scores */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4">Performans Skorları</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <PerformanceGauge score={analytics?.pageSpeedScore || 0} label="PageSpeed" />
                        <PerformanceGauge score={analytics?.mobileScore || 0} label="Mobil" />
                        <PerformanceGauge score={analytics?.seoScore || 0} label="SEO" />
                        <PerformanceGauge score={analytics?.accessibilityScore || 0} label="Erişilebilirlik" />
                    </div>
                </div>
            </div>

            {/* SEO & SSL Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SEO Metrics */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4">SEO Metrikleri</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-neutral-50 rounded-xl">
                            <p className="text-2xl font-bold text-neutral-900">{analytics?.domainAuthority || '-'}</p>
                            <p className="text-xs text-neutral-500 mt-1">Domain Authority</p>
                        </div>
                        <div className="text-center p-4 bg-neutral-50 rounded-xl">
                            <p className="text-2xl font-bold text-neutral-900">{analytics?.backlinks || 0}</p>
                            <p className="text-xs text-neutral-500 mt-1">Backlink</p>
                        </div>
                        <div className="text-center p-4 bg-neutral-50 rounded-xl">
                            <p className="text-2xl font-bold text-neutral-900">{analytics?.indexedPages || 0}</p>
                            <p className="text-xs text-neutral-500 mt-1">Index Sayfa</p>
                        </div>
                    </div>
                </div>

                {/* SSL & Uptime */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4">Güvenlik & Uptime</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sslValid ? 'bg-green-100 text-green-600' :
                                    sslExpiringSoon ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-neutral-900">SSL Sertifikası</p>
                                    <p className="text-xs text-neutral-500">
                                        {analytics?.sslValidUntil
                                            ? `Bitiş: ${new Date(analytics.sslValidUntil).toLocaleDateString('tr-TR')}`
                                            : 'Bilgi yok'
                                        }
                                    </p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${sslValid ? 'bg-green-100 text-green-700' :
                                sslExpiringSoon ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {sslValid ? 'Geçerli' : sslExpiringSoon ? 'Yakında Bitiyor' : 'Kontrol Gerekli'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-neutral-900">Uptime</p>
                                    <p className="text-xs text-neutral-500">Son 30 gün</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-green-600">
                                %{Number(analytics?.uptimePercent || 100).toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Pages */}
            {topPages.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4">En Çok Ziyaret Edilen Sayfalar</h2>
                    <div className="space-y-3">
                        {topPages.map((page, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 bg-white rounded-lg border border-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-600">
                                        {index + 1}
                                    </span>
                                    <span className="text-neutral-700 font-medium">{page.path}</span>
                                </div>
                                <span className="text-neutral-900 font-bold">{page.views.toLocaleString('tr-TR')} görüntüleme</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
