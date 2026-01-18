import { getTicketById, addMessage, updateTicketStatus } from '@/actions/ticket'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Send, User, ShieldCheck, Clock, CheckCircle } from 'lucide-react'
import { TicketStatus } from '@prisma/client'

interface PageProps {
    params: Promise<{ id: string }>
}

const statusMap: Record<string, { label: string, color: string }> = {
    OPEN: { label: 'Açık', color: 'bg-red-100 text-red-700' },
    IN_PROGRESS: { label: 'İnceleniyor', color: 'bg-blue-100 text-blue-700' },
    RESOLVED: { label: 'Çözüldü', color: 'bg-green-100 text-green-700' },
    CLOSED: { label: 'Kapandı', color: 'bg-neutral-100 text-neutral-500' },
}

export default async function TicketDetailPage({ params }: PageProps) {
    const { id } = await params
    const ticket = await getTicketById(id)

    if (!ticket) notFound()

    const status = statusMap[ticket.status]

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/tickets"
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-neutral-900 font-serif">{ticket.subject}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                {status.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                            <span className="font-medium text-neutral-900">{ticket.company.name}</span>
                            <span>•</span>
                            <span>#{ticket.id.slice(0, 8)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {ticket.status !== 'RESOLVED' && (
                        <form action={async () => {
                            'use server'
                            await updateTicketStatus(id, 'RESOLVED')
                        }}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm">
                                <CheckCircle className="w-4 h-4" />
                                Çözüldü Olarak İşaretle
                            </button>
                        </form>
                    )}
                    {ticket.status !== 'IN_PROGRESS' && ticket.status !== 'RESOLVED' && (
                        <form action={async () => {
                            'use server'
                            await updateTicketStatus(id, 'IN_PROGRESS')
                        }}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm">
                                <Clock className="w-4 h-4" />
                                İncelemeye Al
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white border border-neutral-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/50">
                    {ticket.messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-4 max-w-3xl ${msg.isStaffReply ? 'ml-auto flex-row-reverse' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${msg.isStaffReply ? 'bg-brand-600 border-brand-700 text-white' : 'bg-white border-neutral-200 text-neutral-500'}`}>
                                {msg.isStaffReply ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>

                            <div className={`space-y-1 ${msg.isStaffReply ? 'items-end' : 'items-start'} flex flex-col`}>
                                <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.isStaffReply ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-none'}`}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-neutral-400 font-medium px-1">
                                    {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-neutral-200">
                    <form
                        action={async (formData: FormData) => {
                            'use server'
                            const content = formData.get('content') as string
                            if (!content?.trim()) return
                            await addMessage(id, content, true)
                        }}
                        className="flex gap-4 relative"
                    >
                        <textarea
                            name="content"
                            placeholder="Yanıtınızı yazın..."
                            className="w-full pl-4 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none min-h-[60px]"
                            required
                        />
                        <button
                            type="submit"
                            className="absolute right-3 bottom-3 p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-md shadow-brand-600/20"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
