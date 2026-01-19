import Link from 'next/link'
import { LucideIcon, Plus } from 'lucide-react'

interface EmptyStateProps {
    title: string
    description: string
    icon: LucideIcon
    action?: {
        label: string
        href: string
    }
}

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
    return (
        <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
            <p className="text-neutral-500 max-w-md mx-auto mb-8">
                {description}
            </p>
            {action && (
                <Link
                    href={action.href}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30"
                >
                    <Plus className="w-5 h-5" />
                    {action.label}
                </Link>
            )}
        </div>
    )
}
