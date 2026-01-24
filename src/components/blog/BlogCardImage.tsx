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
        <div className="w-full h-full bg-neutral-100 flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-transform duration-700">
            <img
                src={
                    categoryName.toLowerCase().includes('sağlık')
                        ? "/assets/placeholders/isg-health-abstract.png"
                        : "/assets/placeholders/isg-safety-abstract.png"
                }
                alt={`${categoryName} Görsel`}
                className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white/90 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>ProSektorWeb</span>
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
