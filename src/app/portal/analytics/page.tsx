import { getClientAnalytics, getClientAnalyticsSummary } from '@/actions/analytics'
import Link from 'next/link'
import {
    Users, Eye, Clock, TrendingUp, Globe, Zap, Shield,
    BarChart3, ArrowRight, Sparkles, ExternalLink
} from 'lucide-react'

export default async function AnalyticsPage() {
    const projects = await getClientAnalytics()
    const summary = await getClientAnalyticsSummary()

    const hasAnalytics = projects.some((p: any) => p.analytics)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-900 font-serif">Site Analitiği</h1>
                <p className="text-neutral-500 mt-1">
                    Web sitelerinizin performansını ve ziyaretçi istatistiklerini takip edin.
                </p>
            </div>

            {/* Summary Stats */}
            {summary ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-neutral-500">Toplam Ziyaretçi</span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">
                            {summary.totalVisitors.toLocaleString('tr-TR')}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Eye className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-neutral-500">Sayfa Görüntüleme</span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">
                            {summary.totalPageViews.toLocaleString('tr-TR')}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-neutral-500">Ort. Hemen Çıkma</span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">
                            %{summary.avgBounceRate.toFixed(1)}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                <Zap className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-neutral-500">Ort. PageSpeed</span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">
                            {summary.avgPageSpeed?.toFixed(0) || '-'}/100
                        </p>
                    </div>
                </div>
            ) : null}

            {/* Projects List */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-neutral-900">Sitelerim</h2>
                    <span className="text-sm text-neutral-500">{projects.length} yayında site</span>
                </div>

                {projects.length > 0 ? (
                    <div className="space-y-4">
                        {projects.map((project: any) => {
                            const analytics = project.analytics
                            return (
                                <Link
                                    key={project.id}
                                    href={`/portal/analytics/${project.id}`}
                                    className="block p-5 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl border border-neutral-200 flex items-center justify-center text-brand-600">
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-neutral-900 group-hover:text-brand-600 transition-colors">
                                                    {project.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                                    {project.domain?.name || project.siteUrl?.replace('https://', '')}
                                                    {project.siteUrl && (
                                                        <a
                                                            href={project.siteUrl}
                                                            target="_blank"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-brand-600 hover:text-brand-700"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {analytics ? (
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-neutral-900">
                                                        {analytics.totalVisitors.toLocaleString('tr-TR')}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">Ziyaretçi</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-neutral-900">
                                                        {analytics.pageViews.toLocaleString('tr-TR')}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">Sayfa Görüntüleme</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-bold ${(analytics.pageSpeedScore || 0) >= 90 ? 'text-green-600' :
                                                            (analytics.pageSpeedScore || 0) >= 50 ? 'text-amber-600' : 'text-red-600'
                                                        }`}>
                                                        {analytics.pageSpeedScore || '-'}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">PageSpeed</p>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-brand-600 transition-colors" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-neutral-400">Veri bekleniyor</span>
                                                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-brand-600 transition-colors" />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h3 className="font-bold text-neutral-900 mb-2">Yayında site yok</h3>
                        <p className="text-neutral-500 text-sm mb-6">
                            Analitik verileri, siteniz yayına alındığında görüntülenecektir.
                        </p>
                        <Link
                            href="/portal/projects"
                            className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700"
                        >
                            Projelerimi Gör <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>

            {/* Feature Info */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-8 text-white">
                <div className="flex items-start gap-6">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                        <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">Detaylı Analitik Raporları</h3>
                        <p className="text-brand-100 mb-4">
                            Google Analytics entegrasyonu ile sitenizin detaylı ziyaretçi istatistiklerini,
                            trafik kaynaklarını, en popüler sayfalarını ve daha fazlasını takip edin.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <Users className="w-5 h-5 mx-auto mb-1" />
                                <span className="text-xs">Ziyaretçi Takibi</span>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <Zap className="w-5 h-5 mx-auto mb-1" />
                                <span className="text-xs">Hız Analizi</span>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <Shield className="w-5 h-5 mx-auto mb-1" />
                                <span className="text-xs">Uptime İzleme</span>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                                <span className="text-xs">SEO Skorları</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
