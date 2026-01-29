import { getSitePackage, requestRevision } from '@/actions/site-package'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, XCircle, Play, Plus } from 'lucide-react'
import { RevisionRequestForm } from './RevisionRequestForm'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    REQUESTED: { label: 'Talep Edildi', color: 'bg-yellow-100 text-yellow-700' },
    IN_PROGRESS: { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-700' },
    COMPLETED: { label: 'Tamamlandi', color: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Reddedildi', color: 'bg-red-100 text-red-700' },
}

export default async function RevisionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const pkg = await getSitePackage(id)

    if (!pkg) {
        notFound()
    }

    const remaining = pkg.maxRevisions - pkg.usedRevisions
    const canRequest = remaining > 0

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href={`/portal/projects/${id}`}
                    className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Projeye Don
                </Link>
                <h1 className="text-2xl font-bold text-neutral-900 font-serif">Revizyonlar</h1>
            </div>

            {/* Quota */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900">Revizyon Haklariniz</h2>
                        <p className="text-sm text-neutral-500 mt-1">
                            {pkg.usedRevisions}/{pkg.maxRevisions} kullanildi
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {Array.from({ length: pkg.maxRevisions }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${i < pkg.usedRevisions ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-400'}`}
                            >
                                {i < pkg.usedRevisions ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">{i + 1}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Request Form */}
            {canRequest ? (
                <RevisionRequestForm projectId={id} />
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                    <p className="text-amber-800 font-medium">Revizyon hakkiniz dolmustur.</p>
                    <p className="text-amber-600 text-sm mt-1">
                        Ek revizyon icin bizimle iletisime gecin.
                    </p>
                </div>
            )}

            {/* Revision History */}
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-neutral-100">
                    <h2 className="text-lg font-bold text-neutral-900">Revizyon Gecmisi</h2>
                </div>
                {pkg.revisions.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500 text-sm">
                        Henuz revizyon talebi yok
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100">
                        {pkg.revisions.map((rev: any) => {
                            const status = STATUS_CONFIG[rev.status] || STATUS_CONFIG.REQUESTED
                            return (
                                <div key={rev.id} className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-neutral-700">#{rev.revisionNumber}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <span className="text-xs text-neutral-400">
                                            {new Date(rev.createdAt).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-700">{rev.description}</p>
                                    {rev.affectedPages && Array.isArray(rev.affectedPages) && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {(rev.affectedPages as string[]).map((p: string) => (
                                                <span key={p} className="px-2 py-0.5 bg-neutral-100 rounded text-xs text-neutral-600">{p}</span>
                                            ))}
                                        </div>
                                    )}
                                    {rev.adminNotes && (
                                        <div className="mt-2 p-2 bg-neutral-50 rounded-lg text-xs text-neutral-600">
                                            <span className="font-semibold">Yanit:</span> {rev.adminNotes}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
