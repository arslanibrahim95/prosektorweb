export const dynamic = 'force-dynamic'

import { getTickets } from '@/features/support/actions/tickets'
import Link from 'next/link'
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

const priorityConfig: Record<string, { label: string, color: string, icon: any }> = {
    LOW: { label: 'Düşük', color: 'bg-neutral-100 text-neutral-600', icon: Clock },
    NORMAL: { label: 'Normal', color: 'bg-blue-50 text-blue-600', icon: CheckCircle },
    HIGH: { label: 'Yüksek', color: 'bg-orange-50 text-orange-600', icon: AlertCircle },
    URGENT: { label: 'Acil', color: 'bg-red-50 text-red-600', icon: AlertCircle },
}

export default async function TicketsPage() {
    const { tickets } = await getTickets()

    // Group tickets by status for Kanban-like columns
    const columns = {
        OPEN: tickets.filter((t) => t.status === 'OPEN'),
        IN_PROGRESS: tickets.filter((t) => t.status === 'IN_PROGRESS'),
        RESOLVED: tickets.filter((t) => t.status === 'RESOLVED'),
    }

    return (
        <div className="space-y-8 flex flex-col h-[calc(100vh-120px)]">
            <div className="flex-shrink-0">
                <PageHeader
                    title="Destek Talepleri"
                    description="Müşteri şikayet ve istek yönetim paneli"
                    action={{
                        label: "Yeni Talep",
                        href: "/admin/tickets/new",
                        icon: Plus
                    }}
                />
            </div>

            {tickets.length === 0 ? (
                <EmptyState
                    title="Destek Talebi Yok"
                    description="Henüz hiç destek talebi açılmamış."
                    icon={MessageSquare}
                    action={{ label: "Yeni Talep Oluştur", href: "/admin/tickets/new" }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
                    {/* Column 1: AÇIK */}
                    <div className="flex flex-col bg-neutral-100/50 rounded-2xl p-4 border border-neutral-200 h-full">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="font-bold text-neutral-700 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                Açık Talepler
                            </h3>
                            <span className="text-xs font-bold bg-white px-2 py-1 rounded-full text-neutral-500 border border-neutral-200">
                                {columns.OPEN.length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            {columns.OPEN.map((ticket: any) => (
                                <TicketCard key={ticket.id} ticket={ticket} />
                            ))}
                        </div>
                    </div>

                    {/* Column 2: İNCELENİYOR */}
                    <div className="flex flex-col bg-neutral-100/50 rounded-2xl p-4 border border-neutral-200 h-full">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="font-bold text-neutral-700 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                İnceleniyor
                            </h3>
                            <span className="text-xs font-bold bg-white px-2 py-1 rounded-full text-neutral-500 border border-neutral-200">
                                {columns.IN_PROGRESS.length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            {columns.IN_PROGRESS.map((ticket: any) => (
                                <TicketCard key={ticket.id} ticket={ticket} />
                            ))}
                        </div>
                    </div>

                    {/* Column 3: ÇÖZÜLDÜ */}
                    <div className="flex flex-col bg-neutral-100/50 rounded-2xl p-4 border border-neutral-200 h-full">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="font-bold text-neutral-700 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                Çözüldü
                            </h3>
                            <span className="text-xs font-bold bg-white px-2 py-1 rounded-full text-neutral-500 border border-neutral-200">
                                {columns.RESOLVED.length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            {columns.RESOLVED.map((ticket: any) => (
                                <TicketCard key={ticket.id} ticket={ticket} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function TicketCard({ ticket }: { ticket: any }) {
    const priority = priorityConfig[ticket.priority] || priorityConfig.NORMAL

    return (
        <Link
            href={`/admin/tickets/${ticket.id}`}
            className="block bg-white p-4 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md hover:border-brand-200 transition-all group"
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider ${priority.color}`}>
                    {priority.label}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                    {new Date(ticket.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </span>
            </div>

            <h4 className="font-bold text-neutral-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-relaxed">
                {ticket.subject}
            </h4>

            <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-50 pt-3">
                <div className="font-medium truncate max-w-[120px]">
                    {ticket.company.name}
                </div>
                <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{ticket._count.messages}</span>
                </div>
            </div>
        </Link>
    )
}
