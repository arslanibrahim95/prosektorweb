import Link from 'next/link'
import { LucideIcon, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PageHeaderProps {
    title: string
    description?: string
    backUrl?: string
    action?: {
        label: string
        href: string
        icon: LucideIcon
        variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient"
    }
}

export function PageHeader({ title, description, backUrl, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                {backUrl && (
                    <Link
                        href={backUrl}
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                )}
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">{title}</h1>
                    {description && <p className="text-neutral-500 mt-1">{description}</p>}
                </div>
            </div>
            {action && (
                <Button asChild variant={action.variant || "default"}>
                    <Link href={action.href}>
                        <action.icon className="w-4 h-4 mr-2" />
                        {action.label}
                    </Link>
                </Button>
            )}
        </div>
    )
}
