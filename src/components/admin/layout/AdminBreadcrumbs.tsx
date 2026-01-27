'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const labelMap: Record<string, string> = {
    admin: 'Yönetim',
    companies: 'Müşteriler',
    projects: 'Projeler',
    invoices: 'Faturalar',
    tasks: 'Görevler',
    tickets: 'Destek',
    settings: 'Ayarlar',
    generate: 'AI Üretim',
    edit: 'Düzenle',
    new: 'Yeni Kayıt'
}

export function AdminBreadcrumbs() {
    const pathname = usePathname()
    const paths = pathname.split('/').filter(Boolean)

    // Only show for admin routes
    if (!paths.includes('admin')) return null

    return (
        <nav className="flex items-center gap-2 text-xs font-bold text-neutral-400 mb-6 uppercase tracking-widest">
            <Link href="/admin" className="hover:text-brand-600 transition-colors">
                <Home className="w-3.5 h-3.5" />
            </Link>

            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join('/')}`
                const isLast = index === paths.length - 1
                const label = labelMap[path] || path

                // Skip generic IDs (UUIDs usually have dashes)
                if (path.length > 20 || (path.includes('-') && !labelMap[path])) {
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
