'use server'

import { prisma } from '@/lib/prisma'
import { getErrorMessage, getZodErrorMessage, isPrismaUniqueConstraintError } from '@/lib/action-types'
import { requireAuth } from '@/lib/auth-guard'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { encryptSensitive } from '@/lib/auth/crypto'

// ==========================================
// TYPES
// ==========================================

export interface DomainActionResult {
    success: boolean
    data?: any
    error?: string
}

// ==========================================
// DOMAIN CRUD
// ==========================================

const DomainSchema = z.object({
    name: z.string().min(3, 'Domain adı en az 3 karakter olmalı'),
    extension: z.string().min(2),
    companyId: z.string().optional(),
    registrar: z.string().optional(),
    serverIp: z.string().optional(),
    expiresAt: z.string().optional(),
    notes: z.string().optional(),
})

export async function createDomain(formData: FormData): Promise<DomainActionResult> {
    try {
        await requireAuth()

        const rawData = {
            name: formData.get('name') as string,
            extension: formData.get('extension') as string,
            companyId: formData.get('companyId') as string || undefined,
            registrar: formData.get('registrar') as string || undefined,
            serverIp: formData.get('serverIp') as string || undefined,
            expiresAt: formData.get('expiresAt') as string || undefined,
            notes: formData.get('notes') as string || undefined,
        }

        const validated = DomainSchema.parse(rawData)

        // Combine name with extension
        const fullDomain = validated.name.toLowerCase().replace(/\s/g, '') + validated.extension

        const domain = await prisma.domain.create({
            data: {
                name: fullDomain,
                extension: validated.extension,
                companyId: validated.companyId || null,
                registrar: validated.registrar || null,
                serverIp: validated.serverIp || null,
                expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
                notes: validated.notes || null,
                status: 'ACTIVE',
                registeredAt: new Date(),
            },
        })

        revalidatePath('/admin/domains')
        return { success: true, data: domain }
    } catch (error: unknown) {
        console.error('createDomain error:', error)
        if (isPrismaUniqueConstraintError(error)) {
            return { success: false, error: 'Bu domain zaten kayıtlı.' }
        }
        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }
        return { success: false, error: 'Domain eklenirken hata oluştu.' }
    }
}

export async function getDomains(search?: string) {
    try {
        const session = await auth()
        if (!session?.user) return []

        const where: any = search
            ? { name: { contains: search } }
            : {}

        // Tenant isolation for non-admin users
        if (session.user.role !== 'ADMIN') {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true }
            })
            if (!user?.companyId) return []
            where.companyId = user.companyId
        }

        const domains = await prisma.domain.findMany({
            where,
            include: {
                company: { select: { id: true, name: true } },
                _count: { select: { dnsRecords: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
        return domains
    } catch (error) {
        console.error('getDomains error:', error)
        return []
    }
}

export async function getDomainById(id: string) {
    try {
        const session = await auth()
        if (!session?.user) return null

        const domain = await prisma.domain.findUnique({
            where: { id },
            include: {
                company: { select: { id: true, name: true } },
                dnsRecords: { orderBy: { type: 'asc' } },
            },
        })

        if (!domain) return null

        // IDOR Check
        if (session.user.role !== 'ADMIN' && domain.companyId) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true }
            })
            if (!user?.companyId || domain.companyId !== user.companyId) {
                return null
            }
        }

        return domain
    } catch (error) {
        console.error('getDomainById error:', error)
        return null
    }
}

export async function updateDomain(id: string, formData: FormData): Promise<DomainActionResult> {
    try {
        await requireAuth()

        const data: any = {}

        const serverIp = formData.get('serverIp') as string
        const status = formData.get('status') as string
        const sslEnabled = formData.get('sslEnabled')
        const notes = formData.get('notes') as string
        const expiresAt = formData.get('expiresAt') as string

        if (serverIp !== null) data.serverIp = serverIp || null
        if (status) data.status = status
        if (sslEnabled !== null) data.sslEnabled = sslEnabled === 'on'
        if (notes !== null) data.notes = notes || null
        if (expiresAt) data.expiresAt = new Date(expiresAt)

        await prisma.domain.update({
            where: { id },
            data,
        })

        revalidatePath('/admin/domains')
        revalidatePath(`/admin/domains/${id}`)
        return { success: true }
    } catch (error) {
        console.error('updateDomain error:', error)
        return { success: false, error: 'Güncelleme başarısız.' }
    }
}

export async function deleteDomain(id: string): Promise<DomainActionResult> {
    try {
        await requireAuth()

        await prisma.domain.delete({ where: { id } })
        revalidatePath('/admin/domains')
        return { success: true }
    } catch (error) {
        console.error('deleteDomain error:', error)
        return { success: false, error: 'Silme başarısız.' }
    }
}

// ==========================================
// DNS RECORDS
// ==========================================

const DnsRecordSchema = z.object({
    domainId: z.string().min(1),
    type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV']),
    name: z.string().min(1, 'Kayıt adı gerekli'),
    value: z.string().min(1, 'Değer gerekli'),
    ttl: z.number().min(60).max(86400).optional(),
    priority: z.number().optional(),
})

export async function createDnsRecord(formData: FormData): Promise<DomainActionResult> {
    try {
        await requireAuth()

        const rawData = {
            domainId: formData.get('domainId') as string,
            type: formData.get('type') as string,
            name: formData.get('name') as string || '@',
            value: formData.get('value') as string,
            ttl: parseInt(formData.get('ttl') as string) || 3600,
            priority: formData.get('priority') ? parseInt(formData.get('priority') as string) : undefined,
        }

        const validated = DnsRecordSchema.parse(rawData)

        const record = await prisma.dnsRecord.create({
            data: {
                domainId: validated.domainId,
                type: validated.type,
                name: validated.name,
                value: validated.value,
                ttl: validated.ttl || 3600,
                priority: validated.priority,
            },
        })

        const domain = await prisma.domain.findUnique({ where: { id: validated.domainId } })
        revalidatePath(`/admin/domains/${validated.domainId}`)
        return { success: true, data: record }
    } catch (error: unknown) {
        console.error('createDnsRecord error:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }
        return { success: false, error: 'DNS kaydı eklenirken hata oluştu.' }
    }
}

export async function deleteDnsRecord(id: string, domainId: string): Promise<DomainActionResult> {
    try {
        await requireAuth()

        await prisma.dnsRecord.delete({ where: { id } })
        revalidatePath(`/admin/domains/${domainId}`)
        return { success: true }
    } catch (error) {
        console.error('deleteDnsRecord error:', error)
        return { success: false, error: 'Silme başarısız.' }
    }
}

// ==========================================
// API CONFIG
// ==========================================

export async function getApiConfigs() {
    try {
        await requireAuth(['ADMIN'])
        const configs = await prisma.apiConfig.findMany({
            orderBy: { name: 'asc' },
        })

        // Mask sensitive credentials - don't expose full values
        return configs.map(config => ({
            ...config,
            apiKey: config.apiKey ? '••••••••' + (config.apiKey.slice(-4) || '') : null,
            apiSecret: config.apiSecret ? '••••••••' + (config.apiSecret.slice(-4) || '') : null,
            // Flag to indicate if credentials exist
            hasApiKey: !!config.apiKey,
            hasApiSecret: !!config.apiSecret,
        }))
    } catch (error) {
        console.error('getApiConfigs error:', error)
        return []
    }
}

export async function saveApiConfig(formData: FormData): Promise<DomainActionResult> {
    try {
        await requireAuth()

        const provider = formData.get('provider') as string
        const name = formData.get('name') as string
        const apiKey = formData.get('apiKey') as string
        const apiSecret = formData.get('apiSecret') as string
        const apiEndpoint = formData.get('apiEndpoint') as string
        const defaultIp = formData.get('defaultIp') as string

        // Encrypt sensitive credentials before storing
        const encryptedApiKey = apiKey ? encryptSensitive(apiKey) : null
        const encryptedApiSecret = apiSecret ? encryptSensitive(apiSecret) : null

        await prisma.apiConfig.upsert({
            where: { provider },
            update: {
                name,
                apiKey: encryptedApiKey,
                apiSecret: encryptedApiSecret,
                apiEndpoint: apiEndpoint || null,
                defaultIp: defaultIp || null,
                isActive: true,
            },
            create: {
                provider,
                name,
                apiKey: encryptedApiKey,
                apiSecret: encryptedApiSecret,
                apiEndpoint: apiEndpoint || null,
                defaultIp: defaultIp || null,
                isActive: true,
            },
        })

        revalidatePath('/admin/domains/settings')
        return { success: true }
    } catch (error) {
        console.error('saveApiConfig error:', error)
        return { success: false, error: 'API ayarları kaydedilemedi.' }
    }
}

// ==========================================
// DOMAIN AVAILABILITY CHECK (Updated)
// ==========================================

export interface DomainCheckResult {
    domain: string
    extension: string
    available: boolean
    error?: string
}

export interface DomainSearchResult {
    success: boolean
    results: DomainCheckResult[]
    error?: string
}

async function checkDomainAvailability(domain: string): Promise<boolean> {
    try {
        // First check if we already own this domain
        const existing = await prisma.domain.findUnique({ where: { name: domain } })
        if (existing) return false

        const fetchWithTimeout = async (url: string, timeoutMs: number) => {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), timeoutMs)
            try {
                return await fetch(url, { signal: controller.signal })
            } finally {
                clearTimeout(timeout)
            }
        }

        // RDAP check for .com
        if (domain.endsWith('.com') && !domain.endsWith('.com.tr')) {
            const response = await fetchWithTimeout(
                `https://rdap.verisign.com/com/v1/domain/${domain}`,
                5000
            )
            return response.status === 404
        }

        // DNS check for .com.tr and others
        const dnsResponse = await fetchWithTimeout(
            `https://dns.google/resolve?name=${domain}&type=NS`,
            5000
        )
        const data = await dnsResponse.json()
        return data.Status === 3 || !data.Answer

    } catch (error) {
        return false
    }
}

import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

function isValidLabel(label: string): boolean {
    if (label.length < 1 || label.length > 63) return false
    if (label.startsWith('-') || label.endsWith('-')) return false
    return true
}

export async function searchDomains(query: string): Promise<DomainSearchResult> {
    try {
        const session = await auth()
        if (!session) {
            return { success: false, results: [], error: 'Arama yapmak için giriş yapmalısınız.' }
        }

        // DB-based Rate Limiting (Production Safe)
        const ip = await getClientIp()
        const rateKey = session.user?.id || ip

        // 30 requests per hour per user/IP
        const limit = await checkRateLimit(`domain_search:${rateKey}`, { limit: 30, windowSeconds: 3600 })

        if (!limit.success) {
            return { success: false, results: [], error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyiniz.' }
        }

        let cleanQuery = query.toLowerCase().trim()
        cleanQuery = cleanQuery.replace(/\.(com|net|org|tr|com\.tr)$/i, '')
        cleanQuery = cleanQuery.replace(/^www\./i, '')

        // STRICT VALIDATION: Allow only a-z, 0-9, and hyphens. Block SSRF chars.
        if (!/^[a-z0-9-]+$/.test(cleanQuery)) {
            return { success: false, results: [], error: 'Geçersiz karakterler içeriyor. Sadece harf, rakam ve tire kullanınız.' }
        }

        if (cleanQuery.length < 2) {
            return { success: false, results: [], error: 'En az 2 karakter giriniz.' }
        }

        if (cleanQuery.length > 63) {
            return { success: false, results: [], error: 'Domain adı çok uzun. (max 63 karakter)' }
        }

        if (!isValidLabel(cleanQuery)) {
            return { success: false, results: [], error: 'Domain etiketi geçersiz. Başta/sonda tire olamaz.' }
        }

        const extensions = ['.com', '.com.tr']

        const results = await Promise.all(
            extensions.map(async (ext): Promise<DomainCheckResult> => {
                const fullDomain = `${cleanQuery}${ext}`
                if (fullDomain.length > 253) {
                    return { domain: fullDomain, extension: ext, available: false, error: 'Domain adı çok uzun.' }
                }
                try {
                    const available = await checkDomainAvailability(fullDomain)
                    return { domain: fullDomain, extension: ext, available }
                } catch {
                    return { domain: fullDomain, extension: ext, available: false, error: 'Kontrol edilemedi' }
                }
            })
        )

        return { success: true, results }
    } catch (error) {
        console.error('searchDomains error:', error)
        return { success: false, results: [], error: 'Arama hatası.' }
    }
}

// ==========================================
// STATS
// ==========================================

export async function getDomainStats() {
    try {
        await requireAuth(['ADMIN'])
        const [total, active, pending, expiringSoon] = await Promise.all([
            prisma.domain.count(),
            prisma.domain.count({ where: { status: 'ACTIVE' } }),
            prisma.domain.count({ where: { status: 'PENDING' } }),
            prisma.domain.count({
                where: {
                    expiresAt: {
                        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün içinde
                        gte: new Date(),
                    },
                },
            }),
        ])
        return { total, active, pending, expiringSoon }
    } catch (error) {
        console.error('getDomainStats error:', error)
        return { total: 0, active: 0, pending: 0, expiringSoon: 0 }
    }
}
