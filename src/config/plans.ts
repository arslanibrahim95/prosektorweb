export type PlanType = 'ACTION' | 'VISION'

export interface PlanConfig {
    name: string
    price: number
    features: string[]
    limits: {
        pages: number
        blogPosts: number
        storageMB: number
        support: 'EMAIL' | 'PRIORITY'
    }
}

export const PLANS: Record<PlanType, PlanConfig> = {
    ACTION: {
        name: 'Aksiyon Paketi',
        price: 7000,
        features: [
            'Kurumsal Web Sitesi',
            'Mobil Uyumlu Tasarım',
            'Temel SEO Optimizasyonu',
            'İletişim Formu',
            'WhatsApp Entegrasyonu'
        ],
        limits: {
            pages: 5,
            blogPosts: 0,
            storageMB: 500,
            support: 'EMAIL'
        }
    },
    VISION: {
        name: 'Vizyon Paketi',
        price: 7000, // Şu an aynı kampanya fiyatı
        features: [
            'Her şey dahil (Aksiyon özellikleri)',
            'Gelişmiş SEO Paketi',
            'Blog Modülü',
            'Çoklu Dil Desteği (Altyapı)',
            'Özel Admin Paneli'
        ],
        limits: {
            pages: 15,
            blogPosts: 50,
            storageMB: 2000,
            support: 'PRIORITY'
        }
    }
}

export const ADDONS = {
    EXTRA_PAGE: { name: 'Ek Sayfa', price: 500 },
    SSL_CERT: { name: 'SSL Sertifikası', price: 0 }, // Ücretsiz
}
