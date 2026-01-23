import { getProjectById } from '@/actions/portal'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Globe, Calendar, CheckCircle, Clock, AlertCircle, FileText, Settings } from 'lucide-react'

// Status config with colors and labels
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

// Status order for timeline
const statusOrder = ['DRAFT', 'DESIGNING', 'DEVELOPMENT', 'REVIEW', 'APPROVED', 'DEPLOYING', 'LIVE']

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = await getProjectById(id)

    if (!project) {
        notFound()
    }

    const currentStatusIndex = statusOrder.indexOf(project.status)
    const statusInfo = statusConfig[project.status] || statusConfig.DRAFT

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Link
                        href="/portal/projects"
                        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Tüm Projeler
                    </Link>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">{project.name}</h1>
                    <p className="text-neutral-500 mt-1">
                        {project.company?.name}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/portal/projects/${id}/settings`}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Ayarlar
                    </Link>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.label}
                    </span>
                </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-6">Proje İlerlemesi</h2>
                <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute left-0 right-0 top-5 h-1 bg-neutral-200 rounded-full" />
                    <div
                        className="absolute left-0 top-5 h-1 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(0, (currentStatusIndex / (statusOrder.length - 1)) * 100)}%` }}
                    />

                    {statusOrder.map((status, index) => {
                        const isCompleted = index < currentStatusIndex
                        const isCurrent = index === currentStatusIndex
                        const config = statusConfig[status]

                        return (
                            <div key={status} className="relative flex flex-col items-center z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted
                                    ? 'bg-brand-600 text-white'
                                    : isCurrent
                                        ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                                        : 'bg-neutral-100 text-neutral-400'
                                    }`}>
                                    {isCompleted ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : isCurrent ? (
                                        <Clock className="w-5 h-5" />
                                    ) : (
                                        <span className="text-xs font-bold">{index + 1}</span>
                                    )}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-brand-600' : 'text-neutral-500'}`}>
                                    {config.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Project Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Site Links */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4">Site Bilgileri</h2>
                    <div className="space-y-4">
                        {project.siteUrl && (
                            <a
                                href={project.siteUrl}
                                target="_blank"
                                className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                            >
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-neutral-900">Canlı Site</p>
                                    <p className="text-sm text-neutral-500">{project.siteUrl}</p>
                                </div>
                                <ExternalLink className="w-5 h-5 text-neutral-400" />
                            </a>
                        )}

                        {project.previewUrl && (
                            <a
                                href={project.previewUrl}
                                target="_blank"
                                className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                            >
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <ExternalLink className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-neutral-900">Önizleme</p>
                                    <p className="text-sm text-neutral-500">{project.previewUrl}</p>
                                </div>
                                <ExternalLink className="w-5 h-5 text-neutral-400" />
                            </a>
                        )}

                        {project.domain && (
                            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-neutral-900">Domain</p>
                                    <p className="text-sm text-neutral-500">{project.domain.name}</p>
                                </div>
                            </div>
                        )}

                        {!project.siteUrl && !project.previewUrl && !project.domain && (
                            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl text-neutral-500">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm">Henüz site bilgisi eklenmemiş</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Project Dates */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4">Tarihler</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-neutral-900">Oluşturulma</p>
                                <p className="text-sm text-neutral-500">
                                    {new Date(project.createdAt).toLocaleDateString('tr-TR', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {project.startedAt && (
                            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-neutral-900">Başlangıç</p>
                                    <p className="text-sm text-neutral-500">
                                        {new Date(project.startedAt).toLocaleDateString('tr-TR', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}

                        {project.completedAt && (
                            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-neutral-900">Tamamlanma</p>
                                    <p className="text-sm text-neutral-500">
                                        {new Date(project.completedAt).toLocaleDateString('tr-TR', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Site İçerikleri */}
            {project.generatedContents && project.generatedContents.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-neutral-100">
                        <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-brand-600" />
                            Site İçerikleri
                        </h2>
                        <p className="text-sm text-neutral-500 mt-1">
                            Siteniz için oluşturulan içerikleri inceleyin ve onaylayın
                        </p>
                    </div>
                    <div className="divide-y divide-neutral-100">
                        {project.generatedContents.map((content: any) => {
                            const contentLabels: Record<string, string> = {
                                HOMEPAGE: 'Anasayfa',
                                ABOUT: 'Hakkımızda',
                                SERVICES: 'Hizmetler',
                                CONTACT: 'İletişim',
                                FAQ: 'SSS',
                            }
                            const contentStatus = ({
                                DRAFT: { label: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-700' },
                                APPROVED: { label: 'Onaylandı', color: 'bg-green-100 text-green-700' },
                                REJECTED: { label: 'Reddedildi', color: 'bg-red-100 text-red-700' },
                                PUBLISHED: { label: 'Yayında', color: 'bg-blue-100 text-blue-700' },
                            } as Record<string, { label: string; color: string }>)[content.status] || { label: 'Bekliyor', color: 'bg-neutral-100 text-neutral-600' }

                            return (
                                <Link
                                    key={content.id}
                                    href={`/portal/projects/${id}/content/${content.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-brand-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-neutral-900">
                                                {contentLabels[content.contentType] || content.contentType}
                                            </h3>
                                            {content.metaTitle && (
                                                <p className="text-sm text-neutral-500 truncate max-w-sm">
                                                    {content.metaTitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${contentStatus.color}`}>
                                        {contentStatus.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Notes */}
            {project.notes && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4">Notlar</h2>
                    <p className="text-neutral-600 whitespace-pre-wrap">{project.notes}</p>
                </div>
            )}

            {/* Action Banner for REVIEW status */}
            {project.status === 'REVIEW' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900">İncelemeniz Bekleniyor</h3>
                            <p className="text-sm text-amber-700">Projeyi inceleyip onaylamanız gerekmektedir.</p>
                        </div>
                    </div>
                    <button className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors">
                        Onayla
                    </button>
                </div>
            )}
        </div>
    )
}
