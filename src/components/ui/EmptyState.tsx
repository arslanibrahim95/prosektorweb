import Link from 'next/link'
import { LucideIcon, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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
                <Button asChild>
                    <Link href={action.href}>
                        <Plus className="w-4 h-4 mr-2" />
                        {action.label}
                    </Link>
                </Button>
            )}
        </div>
    )
}
