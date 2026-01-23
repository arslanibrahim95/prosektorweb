'use server'

import { getCloudflareService, getDefaultServerIp } from '@/lib/cloudflare'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

// ==========================================
// TYPES
// ==========================================

export interface DomainSearchResult {
    domain: string
    tld: string
    available: boolean
    premium: boolean
    registerPrice?: number
    renewPrice?: number
    currency?: string
    error?: string
}

export interface RegistrationResult {
    success: boolean
    domain?: any
    error?: string
}

// ==========================================
// HELPERS
// ==========================================
async function requireAdmin() {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
    }
}

// ==========================================
// DOMAIN AVAILABILITY CHECK WITH PRICING
// ==========================================

export async function searchDomainsWithPricing(query: string): Promise<{
    success: boolean
    results: DomainSearchResult[]
    error?: string
}> {
    try {
        // Search public access? Let's limit it to authenticated users at least
        const session = await auth()
        if (!session) {
            return { success: false, results: [], error: 'Oturum açmanız gerekiyor' }
        }

        const cf = await getCloudflareService()
        if (!cf) {
            return { success: false, results: [], error: 'Cloudflare yapılandırılmamış' }
        }

        // Clean query
        let cleanQuery = query.toLowerCase().trim()
        cleanQuery = cleanQuery.replace(/\.(com|net|org|io|co)$/i, '')
        cleanQuery = cleanQuery.replace(/^www\./i, '')
        cleanQuery = cleanQuery.replace(/[^a-z0-9-]/g, '')

        if (cleanQuery.length < 2) {
            return { success: false, results: [], error: 'En az 2 karakter giriniz.' }
        }

        // Check multiple TLDs
        const tlds = ['com', 'net', 'org']

        const results = await Promise.all(
            tlds.map(async (tld): Promise<DomainSearchResult> => {
                const fullDomain = `${cleanQuery}.${tld}`

                try {
                    // Check availability
                    const availResult = await cf.checkDomainAvailability(fullDomain)

                    // Get pricing
                    const priceResult = await cf.getDomainPricing(tld)

                    return {
                        domain: fullDomain,
                        tld: `.${tld}`,
                        available: availResult.available,
                        premium: availResult.premium,
                        registerPrice: priceResult.registerPrice,
                        renewPrice: priceResult.renewPrice,
                        currency: priceResult.currency,
                        error: availResult.error || priceResult.error,
                    }
                } catch (error) {
                    return {
                        domain: fullDomain,
                        tld: `.${tld}`,
                        available: false,
                        premium: false,
                        error: 'Kontrol edilemedi',
                    }
                }
            })
        )

        return { success: true, results }
    } catch (error) {
        console.error('searchDomainsWithPricing error:', error)
        return { success: false, results: [], error: 'Arama hatası' }
    }
}

// ==========================================
// REGISTER DOMAIN
// ==========================================

export async function purchaseDomain(
    domain: string,
    contactInfo: {
        firstName: string
        lastName: string
        organization?: string
        address: string
        city: string
        postalCode: string
        country: string
        phone: string
        email: string
    },
    companyId?: string
): Promise<RegistrationResult> {
    try {
        await requireAdmin()

        const cf = await getCloudflareService()
        if (!cf) {
            return { success: false, error: 'Cloudflare yapılandırılmamış' }
        }

        // Pre-flight Check: Verify availability and Premium status again
        // "Fail Closed": If we can't verify price/status, do NOT proceed.
        const availability = await cf.checkDomainAvailability(domain)
        if (!availability.available) {
            return { success: false, error: 'Alan adı artık müsait değil.' }
        }

        // Block Premium domains for safety unless we implement specific premium flow
        if (availability.premium) {
            return { success: false, error: 'Premium alan adları şu an otomatik satın alınamaz. Lütfen destek ile iletişime geçin.' }
        }

        // Register domain via Cloudflare
        const result = await cf.registerDomain(domain, 1, contactInfo)

        if (!result.success) {
            return { success: false, error: result.error }
        }

        // Save to our database
        const serverIp = getDefaultServerIp()
        const tld = '.' + domain.split('.').slice(1).join('.')

        await prisma.domain.create({
            data: {
                name: domain,
                extension: tld,
                status: 'ACTIVE',
                registrar: 'Cloudflare',
                serverIp: serverIp || null,
                registeredAt: new Date(),
                expiresAt: new Date(result.domain.expires_at),
                companyId: companyId || null,
                notes: 'Cloudflare üzerinden satın alındı',
            },
        })

        // Create DNS zone and standard records if we have a server IP
        if (serverIp) {
            try {
                await cf.createZone(domain)
                const zone = await cf.getZoneByName(domain)
                if (zone) {
                    await cf.createStandardWebsiteDns(zone.id, domain, serverIp)
                }
            } catch (e) {
                console.log('DNS setup warning:', e)
            }
        }

        revalidatePath('/admin/domains')
        return { success: true, domain: result.domain }
    } catch (error) {
        console.error('purchaseDomain error:', error)
        return { success: false, error: 'Satın alma hatası' }
    }
}

// ==========================================
// GET TLD PRICING
// ==========================================

export async function getAllTldPricing(): Promise<{
    success: boolean
    pricing: Array<{ tld: string; register: number; renew: number }>
    error?: string
}> {
    try {
        const session = await auth()
        if (!session) {
            return { success: false, pricing: [], error: 'Oturum açmanız gerekiyor' }
        }

        const cf = await getCloudflareService()
        if (!cf) {
            return { success: false, pricing: [], error: 'Cloudflare yapılandırılmamış' }
        }

        const accountId = await cf.getAccountId()
        if (!accountId) {
            return { success: false, pricing: [], error: 'Hesap bulunamadı' }
        }

        // Get pricing for popular TLDs
        const tlds = ['com', 'net', 'org', 'io', 'co', 'dev', 'app']
        const pricing: Array<{ tld: string; register: number; renew: number }> = []

        for (const tld of tlds) {
            const result = await cf.getDomainPricing(tld)
            if (result.registerPrice) {
                pricing.push({
                    tld: `.${tld}`,
                    register: result.registerPrice,
                    renew: result.renewPrice || result.registerPrice,
                })
            }
        }

        return { success: true, pricing }
    } catch (error) {
        console.error('getAllTldPricing error:', error)
        return { success: false, pricing: [], error: 'Fiyat alınamadı' }
    }
}
