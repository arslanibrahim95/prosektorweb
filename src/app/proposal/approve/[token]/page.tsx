'use client'

import { useEffect, useState } from 'react'
import { approveProposalByToken } from '@/actions/proposal'
import { CheckCircle, XCircle, Loader2, FileText } from 'lucide-react'
import Link from 'next/link'

interface Props {
    params: Promise<{ token: string }>
}

export default function ApproveProposalPage({ params }: Props) {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const approve = async () => {
            const { token } = await params
            const result = await approveProposalByToken(token)

            if (result.success) {
                setStatus('success')
                setMessage('Teklifi onayladınız! En kısa sürede sizinle iletişime geçeceğiz.')
            } else {
                setStatus('error')
                setMessage(result.error || 'Bir hata oluştu.')
            }
        }

        approve()
    }, [params])

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden">
                {/* Header */}
                <div className="bg-brand-600 p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white font-serif">Teklif Onayı</h1>
                    <p className="text-brand-100 text-sm mt-2">ProSektorWeb</p>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    {status === 'loading' && (
                        <div className="space-y-4">
                            <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto" />
                            <p className="text-neutral-600">Teklif onaylanıyor...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900">Onay Başarılı!</h2>
                            <p className="text-neutral-600">{message}</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900">Onay Başarısız</h2>
                            <p className="text-neutral-600">{message}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-neutral-50 border-t border-neutral-100 text-center">
                    <Link href="/" className="text-sm text-brand-600 hover:underline font-medium">
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        </div>
    )
}
