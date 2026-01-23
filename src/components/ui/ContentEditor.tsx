'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Undo, Redo } from 'lucide-react'

interface EditorProps {
    content: string
    onChange: (content: string) => void
    editable?: boolean
}

export function ContentEditor({ content, onChange, editable = true }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-brand-600 hover:underline',
                },
            }),
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

    return (
        <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-neutral-200 bg-neutral-50 flex-wrap">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-neutral-200 transition-colors ${editor.isActive('bold') ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600'}`}
                    title="Kalın"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-neutral-200 transition-colors ${editor.isActive('italic') ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600'}`}
                    title="İtalik"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-neutral-200 mx-1" />
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-neutral-200 transition-colors ${editor.isActive('bulletList') ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600'}`}
                    title="Liste"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-neutral-200 transition-colors ${editor.isActive('orderedList') ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600'}`}
                    title="Sıralı Liste"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-neutral-200 mx-1" />
                <button
                    onClick={() => {
                        const previousUrl = editor.getAttributes('link').href
                        const url = window.prompt('URL:', previousUrl)
                        if (url === null) return
                        if (url === '') {
                            editor.chain().focus().extendMarkRange('link').unsetLink().run()
                            return
                        }
                        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
                    }}
                    className={`p-2 rounded hover:bg-neutral-200 transition-colors ${editor.isActive('link') ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600'}`}
                    title="Link"
                >
                    <LinkIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-neutral-200 mx-1" />
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-2 rounded hover:bg-neutral-200 transition-colors text-neutral-600 disabled:opacity-50"
                    title="Geri Al"
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-2 rounded hover:bg-neutral-200 transition-colors text-neutral-600 disabled:opacity-50"
                    title="İleri Al"
                >
                    <Redo className="w-4 h-4" />
                </button>
            </div>

            {/* Editor Area */}
            <EditorContent editor={editor} />
        </div>
    )
}
