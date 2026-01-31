'use client'

import { updateClientProfile } from '@/features/crm/actions/client-portal'
import { useState } from 'react'
import { toast } from 'sonner'
import { User, Mail, Save, Loader2 } from 'lucide-react'

interface Props {
    user: {
        name?: string | null
        email?: string | null
    }
}

export function ProfileForm({ user }: Props) {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const name = formData.get('name') as string
        const email = formData.get('email') as string

        try {
            const result = await updateClientProfile({ name, email })
            if (result.success) {
                toast.success('Profil bilgileriniz güncellendi.')
            } else {
                toast.error(result.error || 'Bir hata oluştu.')
            }
        } catch {
            toast.error('Beklenmedik bir hata oluştu.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-brand-600" />
                Profil Bilgileri
            </h2>
            <form action={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Ad Soyad</label>
                    <div className="relative">
                        <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                            name="name"
                            defaultValue={user.name || ''}
                            type="text"
                            required
                            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                            placeholder="Adınız Soyadınız"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">E-posta Adresi</label>
                    <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                            name="email"
                            defaultValue={user.email || ''}
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                            placeholder="ornek@sirket.com"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium ml-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Değişiklikleri Kaydet
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
