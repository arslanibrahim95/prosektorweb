import { getClientDashboardStats, getClientServices, getClientProjects } from '@/actions/portal'
import Link from 'next/link'
import { Layers, Ticket, Receipt, ArrowRight, ExternalLink } from 'lucide-react'

export default async function PortalDashboard() {
    const stats = await getClientDashboardStats()
    const services = await getClientServices()
    const projects = await getClientProjects()

    // Mock stats if null (e.g. admin viewing)
    const displayStats = stats || { activeProjects: 0, openTickets: 0, unpaidAmount: 0 }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-neutral-900 font-serif">Hoş Geldiniz</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Layers className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-neutral-900">{displayStats.activeProjects}</span>
                    </div>
                    <h3 className="text-sm font-medium text-neutral-600">Aktif Projeler</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-neutral-900">{displayStats.openTickets}</span>
                    </div>
                    <h3 className="text-sm font-medium text-neutral-600">Açık Destek Talepleri</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-neutral-900">
                            {Number(displayStats.unpaidAmount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-neutral-600">Ödenecek Tutar</h3>
                </div>
            </div>

            {/* Quick Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Services */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4">Hizmetlerim</h2>
                    <div className="space-y-4">
                        {services.slice(0, 3).map((service: any) => (
                            <div key={service.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                                <div>
                                    <h4 className="font-bold text-neutral-800">{service.name}</h4>
                                    <p className="text-xs text-neutral-500">
                                        Yenileme: {new Date(service.renewDate).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${service.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-600'}`}>
                                    {service.status === 'ACTIVE' ? 'Aktif' : 'Bitti'}
                                </span>
                            </div>
                        ))}
                        {services.length === 0 && <p className="text-neutral-400 text-sm">Kayıtlı hizmet bulunamadı.</p>}
                    </div>
                </div>

                {/* Projects */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4">Son Projeler</h2>
                    <div className="space-y-4">
                        {projects.slice(0, 3).map((project: any) => (
                            <div key={project.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                                <div>
                                    <h4 className="font-bold text-neutral-800">{project.name}</h4>
                                    {project.siteUrl && (
                                        <a href={project.siteUrl} target="_blank" className="flex items-center gap-1 text-xs text-brand-600 hover:underline mt-1">
                                            <ExternalLink className="w-3 h-3" />
                                            Siteye Git
                                        </a>
                                    )}
                                </div>
                                {project.status && (
                                    <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                        {project.status}
                                    </span>
                                )}
                            </div>
                        ))}
                        {projects.length === 0 && <p className="text-neutral-400 text-sm">Proje bulunamadı.</p>}
                    </div>
                    <div className="mt-6 pt-4 border-t border-neutral-100 text-right">
                        <Link href="/portal/projects" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 justify-end">
                            Tüm Projeler <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
