'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import {
    Bold, Italic, List, ListOrdered, Link as LinkIcon, Undo, Redo,
    Image as ImageIcon, Heading1, Heading2, Heading3, Heading4,
    Table as TableIcon, ChevronDown,
} from 'lucide-react'
import { MediaPickerModal } from '@/components/portal/media/MediaPickerModal'

interface EditorProps {
    content: string
    onChange: (content: string) => void
    editable?: boolean
    enableMediaPicker?: boolean
}

export function ContentEditor({ content, onChange, editable = true, enableMediaPicker = false }: EditorProps) {
    const [showMediaPicker, setShowMediaPicker] = useState(false)
    const [showHeadingMenu, setShowHeadingMenu] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4] },
            }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-brand-600 hover:underline',
                },
                validate: href => /^((https?|mailto|tel):)/.test(href),
            }),
            ImageExtension.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto',
                },
            }),
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
        ],
        content,
        editable,
        editorProps: {
            attributes: {
                class: 'prose prose-neutral max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    if (!editor) {
        return null
    }

    if (!editable) {
        return <EditorContent editor={editor} />
    }

    const ToolbarButton = ({ onClick, active, disabled, title, children }: {
        onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${active ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600'} disabled:opacity-50`}
            title={title}
        >
            {children}
        </button>
    )

    return (
        <>
            <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-neutral-200 bg-neutral-50 flex-wrap">
                    {/* Heading dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowHeadingMenu(!showHeadingMenu)}
                            className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-neutral-200 transition-colors text-neutral-600 text-sm"
                            title="Başlık"
                        >
                            {editor.isActive('heading', { level: 1 }) ? 'H1' :
                                editor.isActive('heading', { level: 2 }) ? 'H2' :
                                    editor.isActive('heading', { level: 3 }) ? 'H3' :
                                        editor.isActive('heading', { level: 4 }) ? 'H4' : 'Başlık'}
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        {showHeadingMenu && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                                <button
                                    onClick={() => { editor.chain().focus().setParagraph().run(); setShowHeadingMenu(false) }}
                                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-100"
                                >
                                    Normal
                                </button>
                                {([1, 2, 3, 4] as const).map(level => (
                                    <button
                                        key={level}
                                        onClick={() => { editor.chain().focus().toggleHeading({ level }).run(); setShowHeadingMenu(false) }}
                                        className={`w-full px-3 py-1.5 text-left hover:bg-neutral-100 ${editor.isActive('heading', { level }) ? 'bg-neutral-100 font-bold' : ''}`}
                                    >
                                        <span className={`text-${level === 1 ? 'lg' : level === 2 ? 'base' : 'sm'} font-bold`}>
                                            Başlık {level}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-neutral-200 mx-1" />

                    <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Kalın">
                        <Bold className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="İtalik">
                        <Italic className="w-4 h-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-neutral-200 mx-1" />

                    <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Liste">
                        <List className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Sıralı Liste">
                        <ListOrdered className="w-4 h-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-neutral-200 mx-1" />

                    <ToolbarButton
                        onClick={() => {
                            const previousUrl = editor.getAttributes('link').href
                            const url = window.prompt('URL:', previousUrl)
                            if (url === null) return
                            if (url === '') {
                                editor.chain().focus().extendMarkRange('link').unsetLink().run()
                                return
                            }
                            if (!/^((https?|mailto|tel):)/.test(url)) {
                                alert('Geçersiz URL. Sadece http, https, mailto ve tel protokolleri kabul edilir.')
                                return
                            }
                            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
                        }}
                        active={editor.isActive('link')}
                        title="Link"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </ToolbarButton>

                    {/* Image button */}
                    <ToolbarButton
                        onClick={() => {
                            if (enableMediaPicker) {
                                setShowMediaPicker(true)
                            } else {
                                const url = window.prompt('Görsel URL:')
                                if (url && /^https?:\/\//.test(url)) {
                                    editor.chain().focus().setImage({ src: url }).run()
                                }
                            }
                        }}
                        title="Görsel Ekle"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </ToolbarButton>

                    {/* Table button */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        title="Tablo Ekle"
                    >
                        <TableIcon className="w-4 h-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-neutral-200 mx-1" />

                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Geri Al">
                        <Undo className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="İleri Al">
                        <Redo className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Editor Area */}
                <EditorContent editor={editor} />
            </div>

            {enableMediaPicker && (
                <MediaPickerModal
                    open={showMediaPicker}
                    onClose={() => setShowMediaPicker(false)}
                    onSelect={(asset) => {
                        editor.chain().focus().setImage({ src: asset.url, alt: asset.alt || '' }).run()
                    }}
                />
            )}
        </>
    )
}
