import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ProSektor - OSGB Hizmetleri',
        short_name: 'ProSektor',
        description: 'Is Sagligi ve Guvenligi Hizmetleri - Isyeri Hekimligi, Is Guvenligi Uzmanligi, Risk Analizi',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f766e',
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        categories: ['business', 'productivity'],
        lang: 'tr',
        dir: 'ltr',
    }
}
