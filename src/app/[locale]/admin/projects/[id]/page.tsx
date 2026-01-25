import { getProject } from '@/features/projects/actions/projects'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeft,
    Globe,
    Building2,
    ExternalLink,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle2,
    Link as LinkIcon,
    Sparkles
} from 'lucide-react'
import { ProjectStatusManager } from '@/features/projects/components/ProjectStatusManager'
import { ProjectEditForm } from '@/features/projects/components/ProjectEditForm'
import { ProjectOperations } from '@/features/projects/components/ProjectOperations'

interface ProjectDetailPageProps {
    params: Promise<{ id: string }>
}

const statusConfig: Record<string, { label: string, color: string }> = {
    DRAFT: { label: 'Taslak', color: 'bg-neutral-100 text-neutral-600' },
    DESIGNING: { label: 'Tasarım', color: 'bg-purple-100 text-purple-700' },
    DEVELOPMENT: { label: 'Geliştirme', color: 'bg-blue-100 text-blue-700' },
    REVIEW: { label: 'Müşteri İncelemesi', color: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { label: 'Onaylandı', color: 'bg-green-100 text-green-700' },
    DEPLOYING: { label: 'Deploy Ediliyor', color: 'bg-orange-100 text-orange-700' },
    LIVE: { label: 'Yayında', color: 'bg-emerald-100 text-emerald-700' },
    PAUSED: { label: 'Durduruldu', color: 'bg-neutral-100 text-neutral-600' },
    CANCELLED: { label: 'İptal', color: 'bg-red-100 text-red-700' },
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
    const { id } = await params
    const project = await getProject(id) as any

    if (!project) {
        notFound()
    }

    const status = statusConfig[project.status] || statusConfig.DRAFT

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/projects"
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                            <Globe className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-neutral-900 font-serif">{project.name}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${status.color}`}>
                                    {status.label}
                                </span>
                            </div>
                            <Link href={`/admin/companies/${project.company.id}`} className="text-neutral-500 hover:text-brand-600 flex items-center gap-1 mt-1">
                                <Building2 className="w-4 h-4" />
                                {project.company.name}
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/projects/${id}/generate`}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-medium hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg shadow-brand-600/30"
                    >
                        <Sparkles className="w-4 h-4" />
                        İçerik Üret
                    </Link>
                    {project.previewUrl && (
                        <a
                            href={project.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Önizleme
                        </a>
                    )}
                    {project.siteUrl && (
                        <a
                            href={project.siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-medium hover:bg-emerald-200 transition-colors"
                        >
                            <Globe className="w-4 h-4" />
                            Siteyi Aç
                        </a>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Project Info & Edit */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl border border-neutral-200 p-4">
                            <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
                                <DollarSign className="w-4 h-4" />
                                Fiyat
                            </div>
                            <div className="text-xl font-bold text-neutral-900">
                                {project.price ? `₺${project.price.toNumber().toLocaleString('tr-TR')}` : '-'}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-neutral-200 p-4">
                            <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Ödeme
                            </div>
                            <div className={`text-xl font-bold ${project.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                                {project.isPaid ? 'Ödendi' : 'Bekliyor'}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-neutral-200 p-4">
                            <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
                                <Calendar className="w-4 h-4" />
                                Başlangıç
                            </div>
                            <div className="text-xl font-bold text-neutral-900">
                                {project.startedAt ? new Date(project.startedAt).toLocaleDateString('tr-TR') : '-'}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-neutral-200 p-4">
                            <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
                                <Clock className="w-4 h-4" />
                                Tamamlanma
                            </div>
                            <div className="text-xl font-bold text-neutral-900">
                                {project.completedAt ? new Date(project.completedAt).toLocaleDateString('tr-TR') : '-'}
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <ProjectEditForm project={project} />

                    {/* Operations */}
                    <ProjectOperations project={project} />
                </div>

                {/* Right - Status & Domain */}
                <div className="space-y-6">
                    {/* Status Manager */}
                    <ProjectStatusManager projectId={project.id} currentStatus={project.status} />

                    {/* Domain Info */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                            <LinkIcon className="w-5 h-5 text-brand-600" />
                            Domain
                        </h2>
                        {project.domain ? (
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-neutral-500 mb-1">Domain</div>
                                    <Link href={`/admin/domains/${project.domain.id}`} className="font-medium text-brand-600 hover:underline">
                                        {project.domain.name}
                                    </Link>
                                </div>
                                {project.domain.serverIp && (
                                    <div>
                                        <div className="text-sm text-neutral-500 mb-1">Sunucu IP</div>
                                        <div className="font-mono text-sm">{project.domain.serverIp}</div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-sm text-neutral-500 mb-1">DNS Kayıtları</div>
                                    <div className="font-medium">{project.domain.dnsRecords.length} kayıt</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Globe className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                                <p className="text-neutral-500 text-sm">Domain atanmamış</p>
                                <Link
                                    href="/admin/domains"
                                    className="text-brand-600 text-sm hover:underline mt-2 inline-block"
                                >
                                    Domain Yönetimi →
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    {project.notes && (
                        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                            <h2 className="text-lg font-bold text-neutral-900 mb-4">Notlar</h2>
                            <p className="text-neutral-600 whitespace-pre-wrap">{project.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
