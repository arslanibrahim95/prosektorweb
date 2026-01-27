import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatsColor = 'brand' | 'blue' | 'green' | 'red' | 'orange' | 'yellow' | 'purple' | 'neutral'

interface StatsCardProps {
    label: string
    value: string | number
    icon?: LucideIcon
    trend?: {
        value: string
        isPositive: boolean
    }
    color?: StatsColor
    className?: string
}

const colorMap: Record<StatsColor, string> = {
    brand: 'text-brand-600 bg-brand-50',
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    orange: 'text-orange-600 bg-orange-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    purple: 'text-purple-600 bg-purple-50',
    neutral: 'text-neutral-600 bg-neutral-50',
}

export function StatsCard({ label, value, icon: Icon, color = 'neutral', className }: StatsCardProps) {
    return (
        <div className={cn("bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm", className)}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-500">{label}</span>
                {Icon && (
                    <div className={cn("p-2 rounded-lg", colorMap[color])}>
                        <Icon className="w-4 h-4" />
                    </div>
                )}
            </div>
            <div className="text-2xl font-bold text-neutral-900">{value}</div>
            {/* Future: Add trend if needed */}
        </div>
    )
}
