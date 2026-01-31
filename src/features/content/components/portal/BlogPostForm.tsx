'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, EyeOff, Image as ImageIcon, X } from 'lucide-react'
import { ContentEditor } from '@/shared/components/ui'
import { MediaPickerModal } from '@/features/projects/components/portal/media/MediaPickerModal'

interface BlogPostFormProps {
    projectId: string
    companyId?: string
    basePath?: string // '/admin/projects' or '/portal/projects'
    initialData?: {
        id?: string
        title: string
        slug: string
        excerpt: string
        content: string
        coverImageId: string | null
        coverImageUrl?: string | null
        tags: string[]
        metaTitle: string
        metaDescription: string
        published: boolean
    }
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[çÇ]/g, 'c')
        .replace(/[ğĞ]/g, 'g')
        .replace(/[ıİ]/g, 'i')
        .replace(/[öÖ]/g, 'o')
        .replace(/[şŞ]/g, 's')
        .replace(/[üÜ]/g, 'u')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function BlogPostForm({ projectId, companyId, basePath = '/portal/projects', initialData }: BlogPostFormProps) {
    const router = useRouter()
    const isEdit = !!initialData?.id

    const [title, setTitle] = useState(initialData?.title || '')
    const [slug, setSlug] = useState(initialData?.slug || '')
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
    const [content, setContent] = useState(initialData?.content || '<p></p>')
    const [coverImageId, setCoverImageId] = useState<string | null>(initialData?.coverImageId || null)
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialData?.coverImageUrl || null)
    const [tagsStr, setTagsStr] = useState((initialData?.tags || []).join(', '))
    const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '')
    const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '')
    const [published, setPublished] = useState(initialData?.published || false)
    const [saving, setSaving] = useState(false)
    const [showCoverPicker, setShowCoverPicker] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleTitleChange = (value: string) => {
        setTitle(value)
        if (!isEdit || !initialData?.slug) {
            setSlug(slugify(value))
        }
    }

    const handleSave = async () => {
        setError(null)
        if (!title.trim() || !slug.trim() || !content.trim()) {
            setError('Başlık, slug ve içerik zorunludur.')
            return
        }

        setSaving(true)
        try {
            const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean)
            const body = {
                title, slug, excerpt: excerpt || null, content,
                coverImageId, tags,
                metaTitle: metaTitle || null,
                metaDescription: metaDescription || null,
                published,
            }

            const url = isEdit
                ? `/api/portal/projects/${projectId}/blog/${initialData!.id}`
                : `/api/portal/projects/${projectId}/blog`

            const res = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            const json = await res.json()
            if (!json.success) {
                setError(json.error || 'Kaydetme başarısız.')
                return
            }

            router.push(`${basePath}/${projectId}/blog`)
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Başlık</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => handleTitleChange(e.target.value)}
                            className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-lg"
                            placeholder="Blog yazısı başlığı"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-mono text-sm"
                            placeholder="blog-yazisi-url"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Özet</label>
                        <textarea
                            value={excerpt}
                            onChange={e => setExcerpt(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
                            placeholder="Kısa özet (opsiyonel)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">İçerik</label>
                        <ContentEditor
                            content={content}
                            onChange={setContent}
                            editable={true}
                            enableMediaPicker={true}
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Publish toggle */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-neutral-700">Yayınla</span>
                            <button
                                onClick={() => setPublished(!published)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${published ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'
                                    }`}
                            >
                                {published ? <><Eye className="w-4 h-4" /> Yayında</> : <><EyeOff className="w-4 h-4" /> Taslak</>}
                            </button>
                        </div>
                    </div>

                    {/* Cover image */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3">
                        <label className="block text-sm font-medium text-neutral-700">Kapak Görseli</label>
                        {coverImageUrl ? (
                            <div className="relative">
                                <img src={coverImageUrl} alt="" className="w-full aspect-video object-cover rounded-lg" />
                                <button
                                    onClick={() => { setCoverImageId(null); setCoverImageUrl(null) }}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowCoverPicker(true)}
                                className="w-full aspect-video border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center text-neutral-400 hover:border-brand-400 hover:text-brand-500 transition-colors"
                            >
                                <ImageIcon className="w-8 h-8 mb-1" />
                                <span className="text-sm">Görsel Seç</span>
                            </button>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Etiketler</label>
                        <input
                            type="text"
                            value={tagsStr}
                            onChange={e => setTagsStr(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                            placeholder="etiket1, etiket2, etiket3"
                        />
                        <p className="text-xs text-neutral-400 mt-1">Virgülle ayırın</p>
                    </div>

                    {/* SEO */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3">
                        <h3 className="text-sm font-medium text-neutral-700">SEO</h3>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">
                                Meta Başlık <span className="text-neutral-400">{metaTitle.length}/100</span>
                            </label>
                            <input
                                type="text"
                                value={metaTitle}
                                onChange={e => setMetaTitle(e.target.value)}
                                maxLength={100}
                                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">
                                Meta Açıklama <span className="text-neutral-400">{metaDescription.length}/200</span>
                            </label>
                            <textarea
                                value={metaDescription}
                                onChange={e => setMetaDescription(e.target.value)}
                                maxLength={200}
                                rows={2}
                                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Oluştur'}
                </button>
            </div>

            <MediaPickerModal
                open={showCoverPicker}
                onClose={() => setShowCoverPicker(false)}
                category="BLOG"
                companyId={companyId}
                onSelect={(asset: any) => {
                    setCoverImageId(asset.id)
                    setCoverImageUrl(asset.url)
                }}
            />
        </div>
    )
}
