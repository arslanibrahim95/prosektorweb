'use client'

import { useState } from 'react'
import { Save, Globe, CheckCircle } from 'lucide-react'

interface SeoEditorProps {
    contentId: string
    initialTitle: string | null
    initialDescription: string | null
    pageTitle: string
    siteUrl?: string
}

export function SeoEditor({ contentId, initialTitle, initialDescription, pageTitle, siteUrl }: SeoEditorProps) {
    const [metaTitle, setMetaTitle] = useState(initialTitle || '')
    const [metaDescription, setMetaDescription] = useState(initialDescription || '')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        setSaved(false)
        try {
            const res = await fetch(`/api/portal/content/${contentId}/seo`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metaTitle: metaTitle || null, metaDescription: metaDescription || null }),
            })
            const json = await res.json()
            if (json.success) setSaved(true)
        } finally {
            setSaving(false)
        }
    }

    const displayUrl = siteUrl || 'https://example.com'
    const previewTitle = metaTitle || pageTitle || 'Sayfa Başlığı'
    const previewDesc = metaDescription || 'Sayfa açıklaması buraya gelecek...'

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Meta Başlık
                    <span className={`ml-2 text-xs ${metaTitle.length > 60 ? 'text-red-500' : 'text-neutral-400'}`}>
                        {metaTitle.length}/60
                    </span>
                </label>
                <input
                    type="text"
                    value={metaTitle}
                    onChange={e => { setMetaTitle(e.target.value); setSaved(false) }}
                    maxLength={100}
                    placeholder="Sayfa başlığı (Google'da görünecek)"
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Meta Açıklama
                    <span className={`ml-2 text-xs ${metaDescription.length > 160 ? 'text-red-500' : 'text-neutral-400'}`}>
                        {metaDescription.length}/160
                    </span>
                </label>
                <textarea
                    value={metaDescription}
                    onChange={e => { setMetaDescription(e.target.value); setSaved(false) }}
                    maxLength={200}
                    rows={3}
                    placeholder="Sayfa açıklaması (Google arama sonuçlarında görünecek)"
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
                />
            </div>

            {/* Google Preview */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Google Önizleme</label>
                <div className="p-4 bg-white border border-neutral-200 rounded-xl">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <Globe className="w-3 h-3" />
                            {displayUrl}
                        </div>
                        <h3 className="text-lg text-blue-700 hover:underline cursor-pointer leading-tight">
                            {previewTitle.substring(0, 60)}{previewTitle.length > 60 ? '...' : ''}
                        </h3>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            {previewDesc.substring(0, 160)}{previewDesc.length > 160 ? '...' : ''}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50"
                >
                    {saving ? (
                        <span>Kaydediliyor...</span>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Kaydet
                        </>
                    )}
                </button>
                {saved && (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Kaydedildi
                    </span>
                )}
            </div>
        </div>
    )
}
