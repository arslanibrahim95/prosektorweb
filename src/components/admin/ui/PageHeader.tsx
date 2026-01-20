import Link from 'next/link'
import { LucideIcon, ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
    title: string
    description: string
    backUrl?: string
    action?: {
        label: string
        href: string
        icon: LucideIcon
    }
}

export function PageHeader({ title, description, backUrl, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                {backUrl && (
                    <Link
                        href={backUrl}
                        aria-label="Geri dön"
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                )}
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">{title}</h1>
                    <p className="text-neutral-500 mt-1">{description}</p>
                </div>
            </div>
            {action && (
                <Link
                    href={action.href}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30"
                >
                    <action.icon className="w-5 h-5" />
                    {action.label}
                </Link>
            )}
        </div>
    )
}
