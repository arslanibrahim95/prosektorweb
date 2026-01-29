'use client'

import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/shared/lib'

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
    href?: string
}

const colorMap: Record<StatsColor, { icon: string; bg: string; text: string; gradient: string }> = {
    brand: {
        icon: 'bg-brand-50 text-brand-600',
        bg: 'bg-brand-500',
        text: 'text-brand-600',
        gradient: 'from-brand-500 to-brand-600'
    },
    blue: {
        icon: 'bg-blue-50 text-blue-600',
        bg: 'bg-blue-500',
        text: 'text-blue-600',
        gradient: 'from-blue-500 to-blue-600'
    },
    green: {
        icon: 'bg-green-50 text-green-600',
        bg: 'bg-green-500',
        text: 'text-green-600',
        gradient: 'from-green-500 to-green-600'
    },
    red: {
        icon: 'bg-red-50 text-red-600',
        bg: 'bg-red-500',
        text: 'text-red-600',
        gradient: 'from-red-500 to-red-600'
    },
    orange: {
        icon: 'bg-orange-50 text-orange-600',
        bg: 'bg-orange-500',
        text: 'text-orange-600',
        gradient: 'from-orange-500 to-orange-600'
    },
    yellow: {
        icon: 'bg-yellow-50 text-yellow-600',
        bg: 'bg-yellow-500',
        text: 'text-yellow-600',
        gradient: 'from-yellow-500 to-yellow-600'
    },
    purple: {
        icon: 'bg-purple-50 text-purple-600',
        bg: 'bg-purple-500',
        text: 'text-purple-600',
        gradient: 'from-purple-500 to-purple-600'
    },
    neutral: {
        icon: 'bg-neutral-50 text-neutral-600',
        bg: 'bg-neutral-500',
        text: 'text-neutral-600',
        gradient: 'from-neutral-500 to-neutral-600'
    },
}

export function StatsCard({
    label,
    value,
    icon: Icon,
    trend,
    color = 'neutral',
    className,
    href
}: StatsCardProps) {
    const colors = colorMap[color]

    const content = (
        <div className={cn(
            "group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 transition-all hover:shadow-lg hover:shadow-neutral-200/50",
            className
        )}>
            {/* Background Gradient */}
            <div className={cn(
                "absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5 bg-gradient-to-br",
                colors.gradient
            )} />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    {Icon && (
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                            colors.icon
                        )}>
                            <Icon className="w-6 h-6" />
                        </div>
                    )}
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                            trend.isPositive
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-600"
                        )}>
                            {trend.isPositive ? (
                                <TrendingUp className="w-3 h-3" />
                            ) : (
                                <TrendingDown className="w-3 h-3" />
                            )}
                            {trend.value}
                        </div>
                    )}
                </div>

                {/* Value */}
                <div className="text-3xl font-bold text-neutral-900 tracking-tight mb-1">
                    {value}
                </div>

                {/* Label */}
                <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
                    {label}
                </p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5">
                {Icon && <Icon className="w-full h-full" />}
            </div>
        </div>
    )

    if (href) {
        return <a href={href}>{content}</a>
    }

    return content
}

// Multi-column Stats Grid Component
interface StatsGridProps extends React.PropsWithChildren {
    columns?: 2 | 3 | 4
    className?: string
}

export function StatsGrid({ columns = 3, className, children }: StatsGridProps) {
    return (
        <div className={cn(
            "grid gap-6",
            columns === 2 ? "grid-cols-1 md:grid-cols-2" :
                columns === 4 ? "grid-cols-2 md:grid-cols-4" :
                    "grid-cols-1 md:grid-cols-3",
            className
        )}>
            {children}
        </div>
    )
}

// Financial Stats Card with progress bar
interface FinancialStatsCardProps {
    label: string
    value: string | number
    target?: string | number
    progress?: number
    icon?: LucideIcon
    color?: StatsColor
    className?: string
}

export function FinancialStatsCard({
    label,
    value,
    target,
    progress,
    icon: Icon,
    color = 'brand',
    className
}: FinancialStatsCardProps) {
    const colors = colorMap[color]
    const progressValue = progress !== undefined ? Math.min(100, Math.max(0, progress)) : 0

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 transition-all hover:shadow-lg",
            className
        )}>
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                colors.icon
                            )}>
                                <Icon className="w-6 h-6" />
                            </div>
                        )}
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                            {label}
                        </span>
                    </div>
                </div>

                {/* Main Value */}
                <div className="text-4xl font-black text-neutral-900 tracking-tighter mb-2">
                    {value}
                </div>

                {/* Target & Progress */}
                {target && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-500">Hedef: {target}</span>
                            <span className={cn("font-bold", colors.text)}>
                                {progressValue.toFixed(1)}%
                            </span>
                        </div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    colors.bg
                                )}
                                style={{ width: `${progressValue}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
