import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Ticket, Plus, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react'

const statusColors: Record<string, string> = {
    OPEN: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    RESOLVED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-100 text-gray-600',
}

const statusLabels: Record<string, string> = {
    OPEN: 'Açık',
    IN_PROGRESS: 'İşlemde',
    RESOLVED: 'Çözüldü',
    CLOSED: 'Kapatıldı',
}

const priorityColors: Record<string, string> = {
    LOW: 'text-gray-500',
    MEDIUM: 'text-blue-500',
    HIGH: 'text-orange-500',
    URGENT: 'text-red-500',
}

export default async function PortalTicketsPage() {
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

    const tickets = await prisma.ticket.findMany({
        where: { companyId: user.companyId },
        include: {
            _count: { select: { messages: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    const openCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
    const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Destek Taleplerim</h1>
                    <p className="text-neutral-500 mt-1">Destek taleplerinizi oluşturun ve takip edin</p>
                </div>
                <Link
                    href="/portal/tickets/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-medium shadow-lg shadow-brand-600/30"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Talep
                </Link>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-neutral-900">{openCount}</p>
                        <p className="text-xs text-neutral-500">Açık</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-neutral-900">{resolvedCount}</p>
                        <p className="text-xs text-neutral-500">Çözüldü</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-neutral-900">{tickets.length}</p>
                        <p className="text-xs text-neutral-500">Toplam</p>
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            {tickets.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                    <Ticket className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="font-bold text-neutral-900 mb-2">Henüz destek talebi yok</h3>
                    <p className="text-neutral-500 text-sm mb-6">Yardıma ihtiyacınız varsa yeni bir talep oluşturun.</p>
                    <Link
                        href="/portal/tickets/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Talep Oluştur
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {tickets.map((ticket) => (
                        <Link
                            key={ticket.id}
                            href={`/portal/tickets/${ticket.id}`}
                            className="block bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-lg hover:border-brand-200 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusColors[ticket.status]}`}>
                                            {statusLabels[ticket.status]}
                                        </span>
                                        <span className={`text-xs font-medium ${priorityColors[ticket.priority]}`}>
                                            {ticket.priority === 'URGENT' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                                            {ticket.priority}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-neutral-900 truncate">{ticket.subject}</h3>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="flex items-center gap-1 text-sm text-neutral-400 mb-1">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{ticket._count.messages}</span>
                                    </div>
                                    <p className="text-xs text-neutral-400">
                                        {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
