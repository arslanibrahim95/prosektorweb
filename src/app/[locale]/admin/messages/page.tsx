import { prisma } from '@/server/db'
import Link from 'next/link'
import { MessageSquare, Eye, CheckCircle2, Clock, Mail, Phone, User } from 'lucide-react'

export default async function MessagesPage() {
    let messages: any[] = []
    let error = false

    try {
        messages = await prisma.contactMessage.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
        })
    } catch (e) {
        console.error('Messages fetch error:', e)
        error = true
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Gelen Mesajlar</h1>
                    <p className="text-neutral-500 mt-1">İletişim formundan gelen mesajlar</p>
                </div>
            </div>

            {/* Messages List */}
            {error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-600">
                    Mesajlar yüklenirken hata oluştu.
                </div>
            ) : messages.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">Henüz Mesaj Yok</h3>
                    <p className="text-neutral-500">İletişim formundan gelen mesajlar burada görünecek.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                    <div className="divide-y divide-neutral-100">
                        {messages.map((message) => (
                            <div key={message.id} className={`p-6 hover:bg-neutral-50 transition-colors ${!message.read ? 'bg-blue-50/50' : ''}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-brand-600" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-neutral-900">{message.name}</div>
                                            <div className="text-sm text-neutral-500 flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {message.email}
                                                </span>
                                                {message.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {message.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {message.read ? (
                                            <span className="text-xs text-green-600 flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Okundu
                                            </span>
                                        ) : (
                                            <span className="text-xs text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded-full">
                                                Yeni
                                            </span>
                                        )}
                                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(message.createdAt).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-neutral-700 pl-13">{message.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
