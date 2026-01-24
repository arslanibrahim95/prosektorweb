'use client'

import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'

interface BlogCardImageProps {
    src?: string | null
    alt: string
    categoryName?: string
}

export function BlogCardImage({ src, alt, categoryName = 'Genel' }: BlogCardImageProps) {
    const [error, setError] = useState(false)

    // Fallback UI
    const Fallback = () => (
        <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
            <div className="text-neutral-300 flex flex-col items-center gap-2">
                <ImageIcon className="w-12 h-12" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-50">ProSektorWeb</span>
            </div>
        </div>
    )

    if (!src || error) {
        return <Fallback />
    }

    return (
        <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={() => setError(true)}
        />
    )
}
