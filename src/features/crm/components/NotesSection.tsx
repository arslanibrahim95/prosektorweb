'use client'

import { useActionState, useState } from 'react'
import { createNote, deleteNote, toggleNotePin, CrmActionResult } from '@/features/crm/actions/crm'
import { MessageSquare, Plus, Pin, Trash2, Loader2 } from 'lucide-react'

interface Note {
    id: string
    content: string
    isPinned: boolean
    createdAt: Date
}

interface CrmNotesSectionProps {
    notes: Note[]
    companyId: string
}

const initialState: CrmActionResult = { success: false }

export function CrmNotesSection({ notes, companyId }: CrmNotesSectionProps) {
    const [showForm, setShowForm] = useState(false)

    const formAction = async (prevState: CrmActionResult, formData: FormData) => {
        const result = await createNote(formData)
        if (result.success) {
            setShowForm(false)
        }
        return result
    }

    const [state, action, isPending] = useActionState(formAction, initialState)

    const handleDelete = async (id: string) => {
        if (confirm('Bu notu silmek istediğinizden emin misiniz?')) {
            await deleteNote(id, companyId)
        }
    }

    const handleTogglePin = async (id: string) => {
        await toggleNotePin(id, companyId)
    }

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orange-500" />
                    Notlar
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="p-2 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Add Note Form */}
            {showForm && (
                <form action={action} className="mb-4 p-4 bg-neutral-50 rounded-xl">
                    <input type="hidden" name="companyId" value={companyId} />
                    <textarea
                        name="content"
                        rows={3}
                        placeholder="Not ekle..."
                        required
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                    {state.error && (
                        <p className="text-xs text-red-600 mt-1">{state.error}</p>
                    )}
                    <div className="flex justify-end gap-2 mt-3">
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

            {/* Notes List */}
            {notes.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-6">Henüz not eklenmemiş.</p>
            ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            className={`p-3 rounded-xl text-sm relative group ${note.isPinned ? 'bg-yellow-50 border border-yellow-200' : 'bg-neutral-50'
                                }`}
                        >
                            {note.isPinned && (
                                <Pin className="w-3 h-3 text-yellow-600 absolute top-2 right-2" />
                            )}
                            <p className="text-neutral-700 whitespace-pre-wrap pr-6">{note.content}</p>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-neutral-400">
                                    {new Date(note.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleTogglePin(note.id)}
                                        className="p-1 text-neutral-400 hover:text-yellow-600 rounded transition-colors"
                                        title={note.isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
                                    >
                                        <Pin className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(note.id)}
                                        className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
