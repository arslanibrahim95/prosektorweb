'use client'

import { useState } from 'react'
import { ContentEditor } from '@/components/ui/ContentEditor'
import { FileText, Save, X, Edit2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DOMPurify from 'isomorphic-dompurify'

interface ContentEditorWrapperProps {
    contentId: string
    initialContent: string
    projectId: string
    status: string
}

import { Button } from '@/components/ui/Button'

export function ContentEditorWrapper({
    contentId,
    initialContent,
    projectId,
    status
}: ContentEditorWrapperProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [content, setContent] = useState(initialContent)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/portal/content/${contentId}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            })

            if (response.ok) {
                setIsEditing(false)
                router.refresh()
            }
        } catch (error) {
            console.error('Save error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setContent(initialContent)
        setIsEditing(false)
    }

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
                <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-600" />
                    İçerik
                </h2>
                {!isEditing ? (
                    <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                    >
                        <Edit2 className="w-3 h-3" />
                        Düzenle
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleCancel}
                            disabled={loading}
                            variant="ghost"
                            size="sm"
                        >
                            <X className="w-3 h-3" />
                            İptal
                        </Button>
                        <Button
                            onClick={handleSave}
                            loading={loading}
                            size="sm"
                        >
                            {!loading && <Save className="w-3 h-3" />}
                            Kaydet
                        </Button>
                    </div>
                )}
            </div>

            <div className="p-6">
                {isEditing ? (
                    <ContentEditor
                        content={content}
                        onChange={setContent}
                        editable={true}
                    />
                ) : (
                    <div
                        className="prose prose-neutral max-w-none"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                    />
                )}
            </div>
        </div>
    )
}
