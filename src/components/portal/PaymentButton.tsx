'use client'

import { useState } from 'react'
import { CreditCard, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentButtonProps {
    invoiceNo: string
    amount?: number
}

export function PaymentButton({ invoiceNo, amount }: PaymentButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    // Dummy Bank Data (Should come from config or DB in future)
    const bankDetails = {
        bankName: 'Garanti BBVA',
        accountName: 'ProSektor OSGB Hizmetleri A.Ş.',
        iban: 'TR12 0006 2000 0001 2345 6789 01',
        swift: 'TGBATR2A'
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bankDetails.iban)
        setCopied(true)
        toast.success('IBAN kopyalandı')
        setTimeout(() => setCopied(false), 2000)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
                Online Ödeme Yap
            </button>
        )
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors hidden"
            >
                Online Ödeme Yap
            </button>

            {/* Modal Overlay */}
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
                {/* Modal Content */}
                <div className="bg-white rounded-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600"
                    >
                        ✕
                    </button>

                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
                            <CreditCard className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900">Ödeme Bilgileri</h3>
                        {amount !== undefined && amount > 0 && (
                            <div className="mt-2 text-2xl font-bold text-brand-600">
                                {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </div>
                        )}
                        <p className="text-neutral-500 mt-2 text-sm">
                            Online ödeme sistemimiz bakım aşamasındadır. Lütfen ödemenizi aşağıdaki banka hesabına yapınız.
                        </p>
                    </div>

                    <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-4">
                        <div>
                            <div className="text-xs text-neutral-500 uppercase font-bold mb-1">Alıcı Adı</div>
                            <div className="font-medium text-neutral-900">{bankDetails.accountName}</div>
                        </div>

                        <div>
                            <div className="text-xs text-neutral-500 uppercase font-bold mb-1">Banka</div>
                            <div className="font-medium text-neutral-900">{bankDetails.bankName}</div>
                        </div>

                        <div>
                            <div className="text-xs text-neutral-500 uppercase font-bold mb-1">IBAN</div>
                            <div className="flex items-center gap-2">
                                <code className="font-mono font-bold text-lg text-brand-700 tracking-wider">
                                    {bankDetails.iban}
                                </code>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 hover:bg-white rounded-lg transition-colors text-neutral-500 hover:text-brand-600"
                                    title="Kopyala"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-200">
                            <div className="text-xs text-neutral-500 uppercase font-bold mb-1">Açıklama Kısmına Yazılacak</div>
                            <div className="font-mono bg-white p-2 border border-neutral-200 rounded-lg text-center font-bold text-neutral-700">
                                {invoiceNo}
                            </div>
                            <p className="text-xs text-neutral-400 mt-1 text-center">
                                Lütfen açıklama kısmına sadece fatura numarasını yazınız.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors"
                        >
                            Tamam
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
