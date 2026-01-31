'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { useTranslations } from 'next-intl'

// Removed static map, using translations

export function AdminBreadcrumbs() {
    const t = useTranslations('AdminBreadcrumbs')
    const pathname = usePathname()
    const paths = pathname.split('/').filter(Boolean)

    // Only show for admin routes
    if (!paths.includes('admin')) return null

    return (
        <nav className="flex items-center gap-2 text-xs font-bold text-neutral-400 mb-6 uppercase tracking-widest">
            <Link href="/admin" className="hover:text-brand-600 transition-colors" aria-label={t('admin')}>
                <Home className="w-3.5 h-3.5" />
            </Link>

            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join('/')}`
                const isLast = index === paths.length - 1

                // Try to get translation, fallback to path if not found or if it's an ID
                const isId = path.length > 20 || (path.includes('-') && path.length > 10)
                let label = path

                if (!isId) {
                    try {
                        // Check if key exists (pseudo-check by seeing if it returns key)
                        // In next-intl, if we don't handle error, it returns key. 
                        // But usually we just assume it maps if in keys.
                        // For safety, we can just use t(path).
                        label = t(path as any) === path ? path : t(path as any)
                    } catch (e) {
                        label = path
                    }
                }

                if (isId) {
                    return (
                        <div key={path} className="flex items-center gap-2">
                            <ChevronRight className="w-3 h-3 text-neutral-300" />
                            <span className="text-neutral-500 font-mono lower-case opacity-60">ID:{path.slice(0, 8)}...</span>
                        </div>
                    )
                }

                return (
                    <div key={path} className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-neutral-300" />
                        {isLast ? (
                            <span className="text-neutral-900">{label}</span>
                        ) : (
                            <Link href={href} className="hover:text-neutral-700 transition-colors">
                                {label}
                            </Link>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
