import { getAuditLogs } from '@/lib/audit'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import {
    FileText,
    Plus,
    Trash2,
    Edit,
    LogIn,
    LogOut,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import Link from 'next/link'

const ACTION_ICONS = {
    CREATE: Plus,
    UPDATE: Edit,
    DELETE: Trash2,
    LOGIN: LogIn,
    LOGOUT: LogOut,
}

const ACTION_COLORS = {
    CREATE: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
    LOGIN: 'bg-purple-100 text-purple-700',
    LOGOUT: 'bg-gray-100 text-gray-700',
}

const ACTION_LABELS = {
    CREATE: 'Oluşturma',
    UPDATE: 'Güncelleme',
    DELETE: 'Silme',
    LOGIN: 'Giriş',
    LOGOUT: 'Çıkış',
}

export default async function AuditPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; entity?: string; action?: string }>
}) {
    const params = await searchParams
    const page = parseInt(params.page || '1')
    const entity = params.entity || undefined
    const action = params.action as any || undefined

    const { logs, total, pages, currentPage } = await getAuditLogs({
        page,
        entity,
        action,
        limit: 25,
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">İşlem Geçmişi</h1>
                    <p className="text-gray-500 mt-1">
                        Sistemdeki tüm kritik işlemlerin kaydı ({total} kayıt)
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <select
                    className="px-3 py-2 border rounded-lg text-sm"
                    defaultValue={entity || ''}
                >
                    <option value="">Tüm Modüller</option>
                    <option value="Company">Firma</option>
                    <option value="Invoice">Fatura</option>
                    <option value="Proposal">Teklif</option>
                    <option value="User">Kullanıcı</option>
                </select>

                <select
                    className="px-3 py-2 border rounded-lg text-sm"
                    defaultValue={action || ''}
                >
                    <option value="">Tüm İşlemler</option>
                    <option value="CREATE">Oluşturma</option>
                    <option value="UPDATE">Güncelleme</option>
                    <option value="DELETE">Silme</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                                İşlem
                            </th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                                Modül
                            </th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                                Kullanıcı
                            </th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                                Detay
                            </th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                                Zaman
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    Henüz işlem kaydı bulunmuyor.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => {
                                const Icon = ACTION_ICONS[log.action] || FileText
                                const colorClass = ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'
                                const label = ACTION_LABELS[log.action] || log.action

                                return (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                                                <Icon className="w-3.5 h-3.5" />
                                                {label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {log.entity}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">
                                                    {log.userName || 'Sistem'}
                                                </div>
                                                <div className="text-gray-500 text-xs">
                                                    {log.userEmail || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {log.details ? (
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {JSON.stringify(log.details).slice(0, 50)}
                                                    {JSON.stringify(log.details).length > 50 && '...'}
                                                </code>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDistanceToNow(new Date(log.createdAt), {
                                                addSuffix: true,
                                                locale: tr,
                                            })}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Sayfa {currentPage} / {pages}
                    </p>
                    <div className="flex gap-2">
                        <Link
                            href={`/admin/audit?page=${Math.max(1, currentPage - 1)}`}
                            className={`p-2 rounded-lg border ${currentPage === 1
                                    ? 'opacity-50 pointer-events-none'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <Link
                            href={`/admin/audit?page=${Math.min(pages, currentPage + 1)}`}
                            className={`p-2 rounded-lg border ${currentPage === pages
                                    ? 'opacity-50 pointer-events-none'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
