'use client'

import { useFormStatus } from 'react-dom'
import { LucideIcon, Loader2 } from 'lucide-react'

interface SubmitButtonProps {
    label: string
    icon?: LucideIcon
    className?: string
}

export function SubmitButton({ label, icon: Icon, className }: SubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className={`px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-lg shadow-neutral-900/20 disabled:opacity-70 disabled:cursor-not-allowed ${className || ''}`}
        >
            {pending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : Icon ? (
                <Icon className="w-5 h-5" />
            ) : null}
            {label}
        </button>
    )
}
