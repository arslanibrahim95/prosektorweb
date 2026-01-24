import { getClientServices } from '@/actions/portal'
import Link from 'next/link'
import {
    Clock, Globe, Search, Wrench, Share2, Megaphone, Package,
    Calendar, AlertCircle, CheckCircle
} from 'lucide-react'

const serviceTypeConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
    HOSTING: { label: 'Hosting', icon: Globe, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    DOMAIN: { label: 'Domain', icon: Globe, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    SEO: { label: 'SEO', icon: Search, color: 'text-green-600', bgColor: 'bg-green-100' },
    MAINTENANCE: { label: 'Bakım', icon: Wrench, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    SOCIAL_MEDIA: { label: 'Sosyal Medya', icon: Share2, color: 'text-pink-600', bgColor: 'bg-pink-100' },
    ADS: { label: 'Reklam', icon: Megaphone, color: 'text-red-600', bgColor: 'bg-red-100' },
    OTHER: { label: 'Diğer', icon: Package, color: 'text-neutral-600', bgColor: 'bg-neutral-100' },
}

const billingCycleLabels: Record<string, string> = {
    MONTHLY: 'Aylık',
    YEARLY: 'Yıllık',
    ONETIME: 'Tek Seferlik',
}

export default async function ServicesPage() {
    const { data: services } = await getClientServices(1, 50) // Fetch more for services list

    // Separate active and expired
    const activeServices = services.filter((s: any) => s.status === 'ACTIVE')
    const expiredServices = services.filter((s: any) => s.status !== 'ACTIVE')

    // Check for upcoming renewals
    const today = new Date()
    const upcomingRenewals = activeServices.filter((s: any) => {
        const renewDate = new Date(s.renewDate)
        const daysUntil = Math.ceil((renewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntil <= 30 && daysUntil > 0
    })

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-900 font-serif">Aboneliklerim</h1>
                <p className="text-neutral-500 mt-1">
                    Aktif hizmetlerinizi ve yenileme tarihlerini takip edin.
                </p>
            </div>

            {/* Renewal Warning */}
            {upcomingRenewals.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-amber-900">
                            {upcomingRenewals.length} hizmet yakında yenilenecek
                        </p>
                        <p className="text-sm text-amber-700">
                            Kesintisiz hizmet için ödeme yapmayı unutmayın.
                        </p>
                    </div>
                </div>
            )}

            {/* Active Services */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Aktif Hizmetler ({activeServices.length})
                </h2>

                {activeServices.length > 0 ? (
                    <div className="space-y-4">
                        {activeServices.map((service: any) => {
                            const config = serviceTypeConfig[service.type] || serviceTypeConfig.OTHER
                            const Icon = config.icon
                            const renewDate = new Date(service.renewDate)
                            const daysUntil = Math.ceil((renewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                            const isExpiringSoon = daysUntil <= 30 && daysUntil > 0

                            return (
                                <div key={service.id} className="p-5 bg-neutral-50 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${config.bgColor} ${config.color} flex items-center justify-center`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-neutral-900">{service.name}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} font-medium`}>
                                                        {config.label}
                                                    </span>
                                                    <span className="text-xs text-neutral-500">
                                                        {billingCycleLabels[service.billingCycle]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-neutral-900">
                                                {Number(service.price).toLocaleString('tr-TR', { style: 'currency', currency: service.currency })}
                                            </p>
                                            <p className={`text-xs flex items-center gap-1 justify-end ${isExpiringSoon ? 'text-amber-600' : 'text-neutral-500'}`}>
                                                <Calendar className="w-3 h-3" />
                                                {isExpiringSoon && '⚠️ '}
                                                {renewDate.toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h3 className="font-bold text-neutral-900 mb-2">Aktif hizmet yok</h3>
                        <p className="text-neutral-500 text-sm">
                            Hizmet satın almak için bizimle iletişime geçin.
                        </p>
                    </div>
                )}
            </div>

            {/* Expired Services */}
            {expiredServices.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 opacity-60">
                    <h2 className="text-lg font-bold text-neutral-900 mb-6">
                        Süresi Dolan Hizmetler ({expiredServices.length})
                    </h2>
                    <div className="space-y-3">
                        {expiredServices.map((service: any) => {
                            const config = serviceTypeConfig[service.type] || serviceTypeConfig.OTHER
                            return (
                                <div key={service.id} className="p-4 bg-neutral-50 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600 font-medium`}>
                                            {config.label}
                                        </span>
                                        <span className="text-neutral-700">{service.name}</span>
                                    </div>
                                    <span className="text-xs text-neutral-400">
                                        {new Date(service.renewDate).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
