import { getClientDashboardStats, getClientServices, getClientProjects, getClientProfile } from '@/actions/portal'
import { auth } from '@/auth'
import Link from 'next/link'
import {
    Layers, Ticket, Receipt, ArrowRight, ExternalLink,
    Plus, MessageSquare, Calendar, Globe, Clock,
    Sparkles, ChevronRight, AlertCircle, CheckCircle,
    Phone, Mail, Headphones
} from 'lucide-react'
import SpotlightCard from '@/components/ui/SpotlightCard'

// Status config for projects
const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    DRAFT: { label: 'Taslak', color: 'text-neutral-600', bgColor: 'bg-neutral-100' },
    DESIGNING: { label: 'Tasarım', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    DEVELOPMENT: { label: 'Geliştirme', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    REVIEW: { label: 'İnceleme', color: 'text-amber-600', bgColor: 'bg-amber-100' },
    APPROVED: { label: 'Onaylandı', color: 'text-green-600', bgColor: 'bg-green-100' },
    DEPLOYING: { label: 'Yayınlanıyor', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    LIVE: { label: 'Yayında', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    PAUSED: { label: 'Durduruldu', color: 'text-neutral-600', bgColor: 'bg-neutral-100' },
    CANCELLED: { label: 'İptal', color: 'text-red-600', bgColor: 'bg-red-100' },
}

export default async function PortalDashboard() {
    const session = await auth()
    const stats = await getClientDashboardStats()
    const services = await getClientServices()
    const projects = await getClientProjects()
    const profile = await getClientProfile()

    const displayStats = stats || { activeProjects: 0, openTickets: 0, unpaidAmount: 0 }
    const clientName = profile?.name || session?.user?.name || 'Değerli Müşterimiz'

    // Check for projects needing review
    const projectsNeedingReview = projects.filter((p: any) => p.status === 'REVIEW')

    // Check for upcoming service renewals (within 30 days)
    const upcomingRenewals = services.filter((s: any) => {
        const renewDate = new Date(s.renewDate)
        const now = new Date()
        const daysUntil = Math.ceil((renewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntil <= 30 && daysUntil > 0 && s.status === 'ACTIVE'
    })

    // Get greeting based on time
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi Günler' : 'İyi Akşamlar'

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">
                        {greeting}, <span className="text-brand-600">{clientName.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Projelerinizi ve hizmetlerinizi buradan takip edebilirsiniz.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/portal/tickets/new"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-700 font-medium hover:bg-neutral-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Destek Talebi
                    </Link>
                    <Link
                        href="tel:+905551234567"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-medium shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Phone className="w-4 h-4" />
                        Hemen Ara
                    </Link>
                </div>
            </div>

            {/* Alert Banners */}
            {projectsNeedingReview.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-amber-900">
                                {projectsNeedingReview.length} proje incelemenizi bekliyor
                            </p>
                            <p className="text-sm text-amber-700">
                                Tasarımları onaylamak için projelere göz atın.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/portal/projects/${projectsNeedingReview[0]?.id}`}
                        className="px-4 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors"
                    >
                        İncele
                    </Link>
                </div>
            )}

            {Number(displayStats.unpaidAmount) > 0 && (
                <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-brand-900">
                                {Number(displayStats.unpaidAmount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} ödenmemiş faturanız var
                            </p>
                            <p className="text-sm text-brand-700">
                                Faturalarınızı görüntülemek için tıklayın.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/portal/invoices"
                        className="px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
                    >
                        Faturalar
                    </Link>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/portal/projects" className="group">
                    <SpotlightCard className="shadow-sm hover:shadow-md transition-all border-neutral-200" spotlightColor="rgba(59, 130, 246, 0.1)">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                <Layers className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold text-neutral-900">{displayStats.activeProjects}</span>
                        </div>
                        <h3 className="text-sm font-medium text-neutral-600 flex items-center justify-between">
                            Aktif Projeler
                            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-600 transition-colors" />
                        </h3>
                    </SpotlightCard>
                </Link>

                <Link href="/portal/tickets" className="group">
                    <SpotlightCard className="shadow-sm hover:shadow-md transition-all border-neutral-200" spotlightColor="rgba(168, 85, 247, 0.1)">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-100 transition-colors">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold text-neutral-900">{displayStats.openTickets}</span>
                        </div>
                        <h3 className="text-sm font-medium text-neutral-600 flex items-center justify-between">
                            Açık Destek Talepleri
                            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-600 transition-colors" />
                        </h3>
                    </SpotlightCard>
                </Link>

                <Link href="/portal/invoices" className="group">
                    <SpotlightCard className="shadow-sm hover:shadow-md transition-all border-neutral-200" spotlightColor="rgba(34, 197, 94, 0.1)">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
                                <Receipt className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold text-neutral-900">
                                {Number(displayStats.unpaidAmount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-neutral-600 flex items-center justify-between">
                            Ödenecek Tutar
                            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-600 transition-colors" />
                        </h3>
                    </SpotlightCard>
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Projects - Takes 2 columns */}
                <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-neutral-900">Projelerim</h2>
                        <Link href="/portal/projects" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
                            Tümünü Gör <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {projects.length > 0 ? (
                        <div className="space-y-4">
                            {projects.slice(0, 4).map((project: any) => {
                                const status = statusConfig[project.status] || statusConfig.DRAFT
                                return (
                                    <Link
                                        key={project.id}
                                        href={`/portal/projects/${project.id}`}
                                        className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-neutral-200 flex items-center justify-center text-brand-600">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-neutral-800 group-hover:text-brand-600 transition-colors">
                                                    {project.name}
                                                </h4>
                                                {project.siteUrl && (
                                                    <p className="text-xs text-neutral-500">{project.siteUrl.replace('https://', '')}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.bgColor} ${status.color}`}>
                                                {status.label}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-600 transition-colors" />
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-neutral-400" />
                            </div>
                            <h3 className="font-bold text-neutral-900 mb-2">Henüz projeniz yok</h3>
                            <p className="text-neutral-500 text-sm mb-6">
                                Web sitenizi bizimle oluşturmak için iletişime geçin.
                            </p>
                            <Link
                                href="/portal/tickets/new"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Proje Talep Et
                            </Link>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Services */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-4">Hizmetlerim</h2>

                        {services.length > 0 ? (
                            <div className="space-y-3">
                                {services.slice(0, 3).map((service: any) => {
                                    const renewDate = new Date(service.renewDate)
                                    const now = new Date()
                                    const daysUntil = Math.ceil((renewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                                    const isExpiringSoon = daysUntil <= 30 && daysUntil > 0

                                    return (
                                        <div key={service.id} className="p-4 bg-neutral-50 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-neutral-800 text-sm">{service.name}</h4>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${service.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-neutral-200 text-neutral-600'
                                                    }`}>
                                                    {service.status === 'ACTIVE' ? 'Aktif' : 'Bitti'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                <Calendar className="w-3 h-3" />
                                                <span className={isExpiringSoon ? 'text-amber-600 font-medium' : ''}>
                                                    {isExpiringSoon && '⚠️ '}
                                                    Yenileme: {renewDate.toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Clock className="w-6 h-6 text-neutral-400" />
                                </div>
                                <p className="text-neutral-500 text-sm">Kayıtlı hizmet yok</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Contact */}
                    <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Headphones className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold">Yardıma mı ihtiyacınız var?</h3>
                                <p className="text-brand-100 text-xs">7/24 destek hattı</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <a href="tel:+905551234567" className="flex items-center gap-2 text-sm text-brand-100 hover:text-white transition-colors">
                                <Phone className="w-4 h-4" />
                                +90 555 123 45 67
                            </a>
                            <a href="mailto:destek@prosektorweb.com" className="flex items-center gap-2 text-sm text-brand-100 hover:text-white transition-colors">
                                <Mail className="w-4 h-4" />
                                destek@prosektorweb.com
                            </a>
                        </div>

                        <Link
                            href="/portal/tickets/new"
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-brand-600 rounded-xl font-medium hover:bg-brand-50 transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Mesaj Gönder
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
