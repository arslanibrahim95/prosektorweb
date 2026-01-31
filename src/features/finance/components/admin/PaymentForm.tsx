'use client'

import { useActionState, useEffect, useState } from 'react'
import { createPayment, PaymentActionResult as ActionResult } from '@/features/finance/actions/payments'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PaymentFormProps {
    invoiceId: string
    remaining: number
}

const initialState: ActionResult = {
    success: false,
}

export function PaymentForm({ invoiceId, remaining }: PaymentFormProps) {
    const router = useRouter()
    const [amount, setAmount] = useState<string>('')
    const [idempotencyKey] = useState(() => window.crypto.randomUUID())

    const formAction = async (prevState: ActionResult, formData: FormData) => {
        return await createPayment(formData)
    }

    const [state, action, isPending] = useActionState(formAction, initialState)

    useEffect(() => {
        if (state.success) {
            setAmount('')
            router.refresh()
        }
    }, [state.success, router])

    return (
        <form action={action} className="space-y-4">
            <input type="hidden" name="invoiceId" value={invoiceId} />
            <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

            {/* Success Message */}
            {state.success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Ödeme kaydedildi!
                </div>
            )}

            {/* Error Message */}
            {state.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {state.error}
                </div>
            )}

            {/* Amount */}
            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Tutar <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    name="amount"
                    required
                    min="0.01"
                    max={remaining}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Max: ${remaining.toFixed(2)} ₺`}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
            </div>

            {/* Payment Date */}
            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Ödeme Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    name="paymentDate"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
            </div>

            {/* Payment Method */}
            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Ödeme Yöntemi
                </label>
                <select
                    name="method"
                    defaultValue="BANK"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                >
                    <option value="CASH">Nakit</option>
                    <option value="BANK">Havale/EFT</option>
                    <option value="CREDIT_CARD">Kredi Kartı</option>
                    <option value="OTHER">Diğer</option>
                </select>
            </div>

            {/* Reference */}
            <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Dekont / Referans No
                </label>
                <input
                    type="text"
                    name="reference"
                    placeholder="Opsiyonel"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isPending}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Kaydediliyor...
                    </>
                ) : (
                    'Ödeme Kaydet'
                )}
            </button>
        </form>
    )
}
