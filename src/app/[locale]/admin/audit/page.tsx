import { getAuditLogs } from '@/features/system/actions/audit'
import { AuditAction } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { FileText, Plus, Trash2, Edit, LogIn, LogOut } from 'lucide-react'
import { AuditFilters } from '@/features/system/components/AuditFilters'
import { CursorPagination } from '@/shared/components/ui'
import { Suspense } from 'react'

const ACTION_ICONS: Record<AuditAction, React.ComponentType<{ className?: string }>> = {
    CREATE: Plus,
    UPDATE: Edit,
    DELETE: Trash2,
    LOGIN: LogIn,
    LOGOUT: LogOut,
}

const ACTION_COLORS: Record<AuditAction, string> = {
    CREATE: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
    LOGIN: 'bg-purple-100 text-purple-700',
    LOGOUT: 'bg-gray-100 text-gray-700',
}

const ACTION_LABELS: Record<AuditAction, string> = {
    CREATE: 'Oluşturma',
    UPDATE: 'Güncelleme',
    DELETE: 'Silme',
    LOGIN: 'Giriş',
    LOGOUT: 'Çıkış',
}

// Type guard for AuditAction
function isValidAuditAction(value: string | undefined): value is AuditAction {
    if (!value) return false
    return ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'].includes(value)
}

export default async function AuditPage({
    searchParams,
}: {
    searchParams: Promise<{ cursor?: string; entity?: string; action?: string; startDate?: string; endDate?: string }>
}) {
    const params = await searchParams
    const cursor = params.cursor || undefined
    const entity = params.entity || undefined
    const action = isValidAuditAction(params.action) ? params.action : undefined
    const startDate = params.startDate || undefined
    const endDate = params.endDate || undefined

    const { data: logs, meta } = await getAuditLogs(cursor, 25, {
        startDate,
        endDate,
        entity,
        action,
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">İşlem Geçmişi</h1>
                    <p className="text-gray-500 mt-1">
                        Sistemdeki tüm kritik işlemlerin kaydı
                    </p>
                </div>
            </div>

            {/* Filters - Client Component */}
            <Suspense fallback={<div className="h-10 bg-gray-100 rounded animate-pulse w-64" />}>
                <AuditFilters
                    currentEntity={entity}
                    currentAction={action}
                    currentStartDate={startDate}
                    currentEndDate={endDate}
                />
            </Suspense>

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
                                const Icon = (ACTION_ICONS as any)[log.action]
                                const colorClass = (ACTION_COLORS as any)[log.action]
                                const label = (ACTION_LABELS as any)[log.action]

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
                                                    {typeof log.details === 'object'
                                                        ? JSON.stringify(log.details).slice(0, 50)
                                                        : String(log.details).slice(0, 50)}
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

            {/* Pagination - Client Component */}
            <Suspense fallback={null}>
                <CursorPagination nextCursor={meta.nextCursor} baseUrl="/admin/audit" />
            </Suspense>
        </div>
    )
}
