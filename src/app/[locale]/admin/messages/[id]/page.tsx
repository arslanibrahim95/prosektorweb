import { prisma } from '@/server/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Mail, Calendar, User, Phone } from 'lucide-react'

interface MessageDetailPageProps {
    params: Promise<{ id: string }>
}

export default async function MessageDetailPage({ params }: MessageDetailPageProps) {
    const { id } = await params

    // Mark as read
    try {
        await prisma.contactMessage.update({
            where: { id },
            data: { read: true }
        })
    } catch (e) {
        notFound()
    }

    const message = await prisma.contactMessage.findUnique({
        where: { id }
    })

    if (!message) notFound()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/messages"
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Mesaj Detayı</h1>
                    <div className="flex items-center gap-2 text-neutral-500 mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(message.createdAt).toLocaleString('tr-TR')}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm text-neutral-500">Gönderen</div>
                                <div className="font-bold text-neutral-900">{message.name}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm text-neutral-500">E-posta</div>
                                <div className="font-bold text-neutral-900">{message.email}</div>
                            </div>
                        </div>

                        {message.phone && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm text-neutral-500">Telefon</div>
                                    <div className="font-bold text-neutral-900">{message.phone}</div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500">
                                <span className="font-mono text-xs">ID</span>
                            </div>
                            <div>
                                <div className="text-sm text-neutral-500">Mesaj ID</div>
                                <div className="font-mono text-sm text-neutral-600">{message.id}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">İletişim Mesajı</h3>
                    <div className="prose prose-neutral max-w-none text-neutral-600 whitespace-pre-wrap">
                        {message.message}
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Link
                    href={`mailto:${message.email}?subject=RE: İletişim Formu Mesajınız`}
                    className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
                >
                    <Mail className="w-5 h-5" />
                    Yanıtla
                </Link>
            </div>
        </div>
    )
}
