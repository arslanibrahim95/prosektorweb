'use client'

import { useActionState } from 'react'
import { submitContact, ContactState } from '@/actions/contact'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const initialState: ContactState = {
    success: false,
    message: '',
}

export function ContactForm() {
    const [state, formAction, isPending] = useActionState(submitContact, initialState)

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-neutral-200 shadow-lg">
            {state.success ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Teşekkürler!</h3>
                    <p className="text-neutral-600">{state.message}</p>
                </div>
            ) : (
                <form action={formAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">Ad Soyad</label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                            placeholder="Adınız Soyadınız"
                        />
                        {state.errors?.name && (
                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {state.errors.name[0]}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">Telefon</label>
                        <input
                            name="phone"
                            type="tel"
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                            placeholder="05XX XXX XX XX"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">E-posta</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                            placeholder="ornek@osgb.com"
                        />
                        {state.errors?.email && (
                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {state.errors.email[0]}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">Mesaj</label>
                        <textarea
                            name="message"
                            rows={4}
                            required
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none"
                            placeholder="Mesajınız..."
                        ></textarea>
                        {state.errors?.message && (
                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {state.errors.message[0]}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-start gap-3">
                            <input
                                name="kvkk"
                                type="checkbox"
                                id="kvkk"
                                required
                                className="mt-1 w-4 h-4 text-brand-600 rounded border-neutral-300 focus:ring-brand-500"
                            />
                            <label htmlFor="kvkk" className="text-sm text-neutral-500 cursor-pointer select-none">
                                KVKK onay formunu okudum, onaylıyorum.
                            </label>
                        </div>
                        {state.errors?.kvkk && (
                            <p className="text-sm text-red-600 flex items-center gap-1 pl-7">
                                <AlertCircle className="w-3 h-3" /> {state.errors.kvkk[0]}
                            </p>
                        )}
                    </div>

                    {state.message && !state.success && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {state.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3.5 bg-gradient-to-r from-brand-700 to-brand-600 text-white rounded-lg font-bold shadow-md hover:from-brand-800 hover:to-brand-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                GÖNDERİLİYOR...
                            </>
                        ) : (
                            'GÖNDER'
                        )}
                    </button>
                </form>
            )}
        </div>
    )
}
