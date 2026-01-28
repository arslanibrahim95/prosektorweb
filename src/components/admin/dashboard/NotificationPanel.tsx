'use client'

import { useState } from 'react'
import {
    Bell,
    Check,
    X,
    AlertTriangle,
    Info,
    CheckCircle2,
    AlertCircle,
    Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
    id: string
    type: NotificationType
    title: string
    message: string
    timestamp: Date
    read: boolean
    actionUrl?: string
    actionLabel?: string
}

interface NotificationPanelProps {
    notifications: Notification[]
    onMarkAsRead: (id: string) => void
    onMarkAllAsRead: () => void
    onDismiss: (id: string) => void
}

const typeConfig: Record<NotificationType, { icon: typeof Info; color: string; bgColor: string }> = {
    info: {
        icon: Info,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
    },
    success: {
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
    },
    warning: {
        icon: AlertTriangle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50'
    },
    error: {
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
    },
}

export function NotificationPanel({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onDismiss
}: NotificationPanelProps) {
    const [isOpen, setIsOpen] = useState(false)
    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Panel */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-96 bg-background rounded-xl border border-border shadow-lg z-50 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div>
                                <h3 className="font-semibold text-foreground">Bildirimler</h3>
                                <p className="text-xs text-muted-foreground">
                                    {unreadCount} okunmamış bildirim
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={onMarkAllAsRead}
                                    className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                                >
                                    Tümünü Okundu İşaretle
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        Bildiriminiz yok
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {notifications.map((notification) => {
                                        const config = typeConfig[notification.type]
                                        const Icon = config.icon

                                        return (
                                            <div
                                                key={notification.id}
                                                className={cn(
                                                    "p-4 hover:bg-muted/50 transition-colors relative group",
                                                    !notification.read && "bg-muted/30"
                                                )}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                                        config.bgColor
                                                    )}>
                                                        <Icon className={cn("w-5 h-5", config.color)} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className={cn(
                                                                "text-sm font-medium",
                                                                notification.read ? "text-muted-foreground" : "text-foreground"
                                                            )}>
                                                                {notification.title}
                                                            </h4>
                                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                                {!notification.read && (
                                                                    <button
                                                                        onClick={() => onMarkAsRead(notification.id)}
                                                                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                                                                        title="Okundu işaretle"
                                                                    >
                                                                        <Check className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => onDismiss(notification.id)}
                                                                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                                                                    title="Kaldır"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatTimestamp(notification.timestamp)}
                                                            </span>
                                                            {notification.actionUrl && (
                                                                <a
                                                                    href={notification.actionUrl}
                                                                    className="text-xs text-brand-600 hover:text-brand-700 font-medium ml-auto"
                                                                >
                                                                    {notification.actionLabel || 'Görüntüle'}
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {!notification.read && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-500 rounded-r" />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-border">
                            <a
                                href="/admin/notifications"
                                className="block w-full text-center text-sm text-muted-foreground hover:text-foreground py-2 rounded-lg hover:bg-muted transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                Tüm Bildirimleri Gör
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

// Helper function to format timestamp
function formatTimestamp(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Az önce'
    if (diffMins < 60) return `${diffMins} dk önce`
    if (diffHours < 24) return `${diffHours} saat önce`
    if (diffDays < 7) return `${diffDays} gün önce`

    return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: diffDays > 365 ? 'numeric' : undefined
    })
}
