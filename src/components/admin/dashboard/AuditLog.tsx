'use client'

import { useState } from 'react'
import {
    Shield,
    User,
    Building2,
    FileText,
    DollarSign,
    Globe,
    Settings,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    Clock,
    Search,
    ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/shared/lib'

// Audit log entry types
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'APPROVE' | 'REJECT'
export type AuditEntity = 'Company' | 'Employee' | 'Invoice' | 'User' | 'Project' | 'Domain' | 'Proposal' | 'System'

export interface AuditLogEntry {
    id: string
    action: AuditAction
    entity: AuditEntity
    entityId: string
    userId: string
    userName: string
    userEmail: string
    details: Record<string, unknown>
    ipAddress: string
    userAgent: string
    timestamp: Date
    status: 'success' | 'failure' | 'warning'
}

interface AuditLogProps {
    entries: AuditLogEntry[]
    showFilters?: boolean
    showUser?: boolean
    maxEntries?: number
    className?: string
}

// Action icon and color mapping
const actionConfig: Record<AuditAction, { icon: typeof Shield; color: string; bgColor: string; label: string }> = {
    CREATE: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Oluşturma' },
    UPDATE: { icon: Settings, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Güncelleme' },
    DELETE: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Silme' },
    LOGIN: { icon: User, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Giriş' },
    LOGOUT: { icon: User, color: 'text-neutral-600', bgColor: 'bg-neutral-50', label: 'Çıkış' },
    EXPORT: { icon: FileText, color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Dışa Aktarma' },
    APPROVE: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50', label: 'Onaylama' },
    REJECT: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Reddetme' },
}

// Entity icon mapping
const entityIcons: Record<AuditEntity, typeof Building2> = {
    Company: Building2,
    Employee: User,
    Invoice: DollarSign,
    User: User,
    Project: Globe,
    Domain: Globe,
    Proposal: FileText,
    System: Settings,
}

export function AuditLog({
    entries,
    showFilters = true,
    showUser = true,
    maxEntries,
    className
}: AuditLogProps) {
    const [filterAction, setFilterAction] = useState<AuditAction | 'all'>('all')
    const [filterEntity, setFilterEntity] = useState<AuditEntity | 'all'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Filter entries
    let filteredEntries = [...entries]

    if (filterAction !== 'all') {
        filteredEntries = filteredEntries.filter(e => e.action === filterAction)
    }

    if (filterEntity !== 'all') {
        filteredEntries = filteredEntries.filter(e => e.entity === filterEntity)
    }

    if (searchQuery) {
        filteredEntries = filteredEntries.filter(e =>
            e.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.entity.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }

    // Sort by timestamp (newest first)
    filteredEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Limit entries
    if (maxEntries) {
        filteredEntries = filteredEntries.slice(0, maxEntries)
    }

    const actions = Object.keys(actionConfig) as AuditAction[]
    const entities = Object.keys(entityIcons) as AuditEntity[]

    return (
        <div className={cn("bg-white rounded-3xl border border-neutral-200 overflow-hidden", className)}>
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900">İşlem Geçmişi</h3>
                        <p className="text-sm text-muted-foreground">{filteredEntries.length} kayıt</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="p-4 bg-neutral-50 border-b border-neutral-100 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Kullanıcı, varlık ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border-0 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>

                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value as AuditAction | 'all')}
                        className="px-3 py-2 bg-white border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                        <option value="all">Tüm İşlemler</option>
                        {actions.map(action => (
                            <option key={action} value={action}>{actionConfig[action].label}</option>
                        ))}
                    </select>

                    <select
                        value={filterEntity}
                        onChange={(e) => setFilterEntity(e.target.value as AuditEntity | 'all')}
                        className="px-3 py-2 bg-white border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                        <option value="all">Tüm Varlıklar</option>
                        {entities.map(entity => (
                            <option key={entity} value={entity}>{entity}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Log Entries */}
            <div className="divide-y divide-neutral-100">
                {filteredEntries.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Kayıt bulunamadı</p>
                    </div>
                ) : (
                    filteredEntries.map((entry) => {
                        const actionConf = actionConfig[entry.action]
                        const EntityIcon = entityIcons[entry.entity]

                        return (
                            <div
                                key={entry.id}
                                className="p-4 hover:bg-neutral-50/50 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Action Icon */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                        actionConf.bgColor
                                    )}>
                                        <actionConf.icon className={cn("w-5 h-5", actionConf.color)} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", actionConf.bgColor, actionConf.color)}>
                                                {actionConf.label}
                                            </span>
                                            <span className="text-sm font-medium text-foreground">
                                                {entry.entity}
                                            </span>
                                            {entry.status !== 'success' && (
                                                <span className={cn(
                                                    "text-xs px-2 py-0.5 rounded-full",
                                                    entry.status === 'failure'
                                                        ? "bg-red-50 text-red-600"
                                                        : "bg-amber-50 text-amber-600"
                                                )}>
                                                    {entry.status === 'failure' ? 'Hata' : 'Uyarı'}
                                                </span>
                                            )}
                                        </div>

                                        {showUser && (
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground">{entry.userName}</span>
                                                <span className="text-muted-foreground"> ({entry.userEmail})</span>
                                            </p>
                                        )}

                                        {/* Details */}
                                        {Object.keys(entry.details).length > 0 && (
                                            <div className="mt-2 p-2 bg-neutral-50 rounded-lg text-xs font-mono text-muted-foreground">
                                                {JSON.stringify(entry.details, null, 2)}
                                            </div>
                                        )}

                                        {/* Meta */}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTimestamp(entry.timestamp)}
                                            </span>
                                            <span>{entry.ipAddress}</span>
                                        </div>
                                    </div>

                                    {/* Entity Link */}
                                    <Link
                                        href={`/admin/${entry.entity.toLowerCase()}s/${entry.entityId}`}
                                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </Link>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Footer */}
            {filteredEntries.length > 0 && (
                <div className="p-4 border-t border-neutral-100">
                    <Link
                        href="/admin/audit"
                        className="flex items-center justify-center gap-2 w-full py-2 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
                    >
                        Tüm İşlemleri Gör
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    )
}

// Helper function to format timestamp
function formatTimestamp(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Az önce'
    if (diffMins < 60) return `${diffMins} dk önce`
    if (diffHours < 24) return `${diffHours} saat önce`
    if (diffDays < 7) return `${diffDays} gün önce`

    return new Date(date).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Compact Audit Log Component (for sidebar/small areas)
interface CompactAuditLogProps {
    entries: AuditLogEntry[]
    maxEntries?: number
}

export function CompactAuditLog({ entries, maxEntries = 5 }: CompactAuditLogProps) {
    const sortedEntries = [...entries]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, maxEntries)

    return (
        <div className="space-y-3">
            {sortedEntries.map((entry) => {
                const actionConf = actionConfig[entry.action]
                const ActionIcon = actionConf.icon

                return (
                    <div key={entry.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", actionConf.bgColor)}>
                            <ActionIcon className={cn("w-4 h-4", actionConf.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-foreground truncate">
                                    {entry.userName}
                                </span>
                                <span className={cn("text-[10px] font-bold uppercase", actionConf.color)}>
                                    {actionConf.label}
                                </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                {entry.entity} • {formatTimestamp(entry.timestamp)}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
