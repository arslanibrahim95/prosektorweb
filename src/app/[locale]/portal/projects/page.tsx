import { auth } from '@/auth'
import { getClientProjects } from '@/actions/portal'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, Globe, Calendar, Clock } from 'lucide-react'

const statusColors: Record<string, string> = {
    DRAFT: 'bg-neutral-100 text-neutral-600',
    DESIGNING: 'bg-purple-100 text-purple-700',
    DEVELOPMENT: 'bg-blue-100 text-blue-700',
    REVIEW: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    DEPLOYING: 'bg-orange-100 text-orange-700',
    LIVE: 'bg-emerald-100 text-emerald-700',
    PAUSED: 'bg-neutral-100 text-neutral-600',
    CANCELLED: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
    DRAFT: 'Taslak',
    DESIGNING: 'Tasarım',
    DEVELOPMENT: 'Geliştirme',
    REVIEW: 'İnceleme',
    APPROVED: 'Onaylandı',
    DEPLOYING: 'Deploy Ediliyor',
    LIVE: 'Yayında',
    PAUSED: 'Durduruldu',
    CANCELLED: 'İptal',
}

export default async function PortalProjectsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { company: true }
    })

    if (!user?.companyId) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-neutral-900 mb-2">Firma Bağlantısı Yok</h2>
                <p className="text-neutral-500">Hesabınız henüz bir firmaya bağlanmamış.</p>
            </div>
        )
    }

    const { data: projects } = await getClientProjects(1, 50)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-neutral-900 font-serif">Projelerim</h1>
                <p className="text-neutral-500 mt-1">Web sitesi projelerinizin durumunu takip edin</p>
            </div>

            {projects.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                    <Globe className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="font-bold text-neutral-900 mb-2">Henüz proje yok</h3>
                    <p className="text-neutral-500 text-sm">Yeni bir proje başlatmak için bizimle iletişime geçin.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Header */}
                            <div className="p-6 border-b border-neutral-100">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-bold text-neutral-900">{project.name}</h3>
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusColors[project.status]}`}>
                                        {statusLabels[project.status]}
                                    </span>
                                </div>
                                {project.domain && (
                                    <a
                                        href={`https://${project.domain.name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline"
                                    >
                                        <Globe className="w-4 h-4" />
                                        {project.domain.name}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>

                            {/* Details */}
                            <div className="p-6 bg-neutral-50/50">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-neutral-600">
                                        <Calendar className="w-4 h-4 text-neutral-400" />
                                        <span>Başlangıç: {new Date(project.createdAt).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                    {project.completedAt && (
                                        <div className="flex items-center gap-2 text-neutral-600">
                                            <Clock className="w-4 h-4 text-neutral-400" />
                                            <span>Bitiş: {new Date(project.completedAt).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
