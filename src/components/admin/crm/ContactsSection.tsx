'use client'

import { useActionState, useState } from 'react'
import { createContact, deleteContact, CrmActionResult } from '@/features/crm/actions/crm'
import { Users, Plus, Star, Phone, Mail, Trash2, Loader2 } from 'lucide-react'

interface Contact {
    id: string
    name: string
    title: string | null
    phone: string | null
    email: string | null
    isPrimary: boolean
}

interface CrmContactsSectionProps {
    contacts: Contact[]
    companyId: string
}

const initialState: CrmActionResult = { success: false }

export function CrmContactsSection({ contacts, companyId }: CrmContactsSectionProps) {
    const [showForm, setShowForm] = useState(false)

    const formAction = async (prevState: CrmActionResult, formData: FormData) => {
        const result = await createContact(formData)
        if (result.success) {
            setShowForm(false)
        }
        return result
    }

    const [state, action, isPending] = useActionState(formAction, initialState)

    const handleDelete = async (id: string) => {
        if (confirm('Bu kişiyi silmek istediğinizden emin misiniz?')) {
            await deleteContact(id, companyId)
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    İletişim Kişileri
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="p-2 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Add Contact Form */}
            {showForm && (
                <form action={action} className="mb-4 p-4 bg-neutral-50 rounded-xl space-y-3">
                    <input type="hidden" name="companyId" value={companyId} />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            name="name"
                            placeholder="Ad Soyad *"
                            required
                            className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <input
                            type="text"
                            name="title"
                            placeholder="Ünvan (Müdür vb.)"
                            className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Telefon"
                            className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="E-posta"
                            className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-neutral-600">
                        <input type="checkbox" name="isPrimary" className="rounded" />
                        Ana iletişim kişisi
                    </label>
                    {state.error && (
                        <p className="text-xs text-red-600">{state.error}</p>
                    )}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-3 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                            {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                            Ekle
                        </button>
                    </div>
                </form>
            )}

            {/* Contacts List */}
            {contacts.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-6">Henüz kişi eklenmemiş.</p>
            ) : (
                <div className="space-y-3">
                    {contacts.map((contact) => (
                        <div
                            key={contact.id}
                            className="p-3 bg-neutral-50 rounded-xl group relative"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-neutral-900">{contact.name}</span>
                                        {contact.isPrimary && (
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        )}
                                    </div>
                                    {contact.title && (
                                        <span className="text-xs text-neutral-500">{contact.title}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(contact.id)}
                                    className="p-1 text-neutral-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-all"
                                    title="Sil"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                                {contact.phone && (
                                    <a href={`tel:${contact.phone}`} className="text-neutral-600 hover:text-brand-600 flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {contact.phone}
                                    </a>
                                )}
                                {contact.email && (
                                    <a href={`mailto:${contact.email}`} className="text-neutral-600 hover:text-brand-600 flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {contact.email}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
