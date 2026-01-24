/**
 * Cloudflare API Service
 * DNS Zone and Record Management
 */

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'

interface CloudflareResponse<T> {
    success: boolean
    errors: Array<{ code: number; message: string }>
    messages: string[]
    result: T
}

interface CloudflareZone {
    id: string
    name: string
    status: string
    name_servers: string[]
}

interface CloudflareDnsRecord {
    id: string
    type: string
    name: string
    content: string
    ttl: number
    priority?: number
    proxied?: boolean
}

interface DnsRecordPayload {
    type: string
    name: string
    content: string
    ttl: number
    priority?: number
    proxied?: boolean
}

interface RegisteredDomain {
    name: string
    expires_at: string
    registered_at: string
}

export class CloudflareService {
    private apiToken: string

    constructor(apiToken: string) {
        this.apiToken = apiToken
    }

    private async request<T>(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
        body?: object
    ): Promise<CloudflareResponse<T>> {
        const response = await fetch(`${CLOUDFLARE_API_BASE}${endpoint}`, {
            method,
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        })

        if (!response.ok) {
            const text = await response.text()
            try {
                const data = JSON.parse(text)
                return data as CloudflareResponse<T>
            } catch {
                throw new Error(`Cloudflare API Error (${response.status}): ${text.slice(0, 100)}...`)
            }
        }

        const data = await response.json()
        return data as CloudflareResponse<T>
    }

    // ==========================================
    // TOKEN VERIFICATION
    // ==========================================

    async verifyToken(): Promise<{ valid: boolean; error?: string }> {
        try {
            const response = await this.request<{ status: string }>('/user/tokens/verify')
            return { valid: response.success }
        } catch (error) {
            return { valid: false, error: 'Token doğrulanamadı' }
        }
    }

    // ==========================================
    // ZONE MANAGEMENT
    // ==========================================

    async listZones(): Promise<CloudflareZone[]> {
        try {
            const response = await this.request<CloudflareZone[]>('/zones')
            if (response.success) {
                return response.result
            }
            return []
        } catch (error) {
            console.error('Cloudflare listZones error:', error)
            return []
        }
    }

    async getZoneByName(domainName: string): Promise<CloudflareZone | null> {
        try {
            const response = await this.request<CloudflareZone[]>(`/zones?name=${domainName}`)
            if (response.success && response.result.length > 0) {
                return response.result[0]
            }
            return null
        } catch (error) {
            console.error('Cloudflare getZoneByName error:', error)
            return null
        }
    }

    async createZone(domainName: string): Promise<{ success: boolean; zone?: CloudflareZone; error?: string }> {
        try {
            // Get account ID first
            const accountsResponse = await this.request<Array<{ id: string }>>('/accounts')
            if (!accountsResponse.success || accountsResponse.result.length === 0) {
                return { success: false, error: 'Cloudflare hesabı bulunamadı' }
            }
            const accountId = accountsResponse.result[0].id

            const response = await this.request<CloudflareZone>('/zones', 'POST', {
                name: domainName,
                account: { id: accountId },
                type: 'full',
            })

            if (response.success) {
                return { success: true, zone: response.result }
            }
            return { success: false, error: response.errors[0]?.message || 'Zone oluşturulamadı' }
        } catch (error) {
            console.error('Cloudflare createZone error:', error)
            return { success: false, error: 'API hatası' }
        }
    }

    // ==========================================
    // DNS RECORD MANAGEMENT
    // ==========================================

    async listDnsRecords(zoneId: string): Promise<CloudflareDnsRecord[]> {
        try {
            const response = await this.request<CloudflareDnsRecord[]>(`/zones/${zoneId}/dns_records`)
            if (response.success) {
                return response.result
            }
            return []
        } catch (error) {
            console.error('Cloudflare listDnsRecords error:', error)
            return []
        }
    }

    async createDnsRecord(
        zoneId: string,
        type: string,
        name: string,
        content: string,
        ttl: number = 3600,
        priority?: number,
        proxied: boolean = false
    ): Promise<{ success: boolean; record?: CloudflareDnsRecord; error?: string }> {
        try {
            const body: DnsRecordPayload = { type, name, content, ttl }
            if (priority !== undefined) body.priority = priority
            if (type === 'A' || type === 'AAAA' || type === 'CNAME') {
                body.proxied = proxied
            }

            const response = await this.request<CloudflareDnsRecord>(
                `/zones/${zoneId}/dns_records`,
                'POST',
                body
            )

            if (response.success) {
                return { success: true, record: response.result }
            }
            return { success: false, error: response.errors[0]?.message || 'Kayıt oluşturulamadı' }
        } catch (error) {
            console.error('Cloudflare createDnsRecord error:', error)
            return { success: false, error: 'API hatası' }
        }
    }

    async updateDnsRecord(
        zoneId: string,
        recordId: string,
        type: string,
        name: string,
        content: string,
        ttl: number = 3600,
        priority?: number,
        proxied: boolean = false
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const body: DnsRecordPayload = { type, name, content, ttl }
            if (priority !== undefined) body.priority = priority
            if (type === 'A' || type === 'AAAA' || type === 'CNAME') {
                body.proxied = proxied
            }

            const response = await this.request<CloudflareDnsRecord>(
                `/zones/${zoneId}/dns_records/${recordId}`,
                'PUT',
                body
            )

            return { success: response.success, error: response.errors[0]?.message }
        } catch (error) {
            console.error('Cloudflare updateDnsRecord error:', error)
            return { success: false, error: 'API hatası' }
        }
    }

    async deleteDnsRecord(zoneId: string, recordId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await this.request<{ id: string }>(
                `/zones/${zoneId}/dns_records/${recordId}`,
                'DELETE'
            )
            return { success: response.success, error: response.errors[0]?.message }
        } catch (error) {
            console.error('Cloudflare deleteDnsRecord error:', error)
            return { success: false, error: 'API hatası' }
        }
    }

    // ==========================================
    // PREVIEW & EMAIL ROUTING
    // ==========================================

    async createPreviewSubdomain(
        rootDomain: string,
        subdomain: string,
        serverIp: string
    ): Promise<{ success: boolean; url?: string; error?: string }> {
        try {
            const zone = await this.getZoneByName(rootDomain)
            if (!zone) {
                return { success: false, error: 'Root domain zone bulunamadı' }
            }

            // Create A record for subdomain
            const result = await this.createDnsRecord(
                zone.id,
                'A',
                `${subdomain}.${rootDomain}`,
                serverIp,
                3600,
                undefined,
                true // Proxied
            )

            if (result.success) {
                return { success: true, url: `https://${subdomain}.${rootDomain}` }
            }
            return { success: false, error: result.error }
        } catch (error) {
            console.error('createPreviewSubdomain error:', error)
            return { success: false, error: 'API hatası' }
        }
    }

    async enableEmailRouting(zoneId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Check if enabled first (GET /zones/:id/email/routing/enabled)
            // If not, enable it (POST /zones/:id/email/routing/enabled)
            // Simplified: Just try to enable or assume enabled if we can add rules. 
            // Correct API: POST /zones/{zone_identifier}/email/routing/enabled

            const response = await this.request<{ enabled: boolean }>(
                `/zones/${zoneId}/email/routing/enabled`,
                'POST',
                { enabled: true }
            )

            if (response.success || (response.errors[0]?.message || '').includes('already enabled')) {
                return { success: true }
            }
            return { success: false, error: response.errors[0]?.message }
        } catch (error) {
            // If already enabled it might error contextually, but usually returns success: false
            console.error('enableEmailRouting error:', error)
            return { success: false, error: 'Email routing aktif edilemedi' }
        }
    }

    async createEmailRule(
        zoneId: string,
        email: string, // e.g. info@domain.com
        forwardTo: string // e.g. target@gmail.com
    ): Promise<{ success: boolean; error?: string }> {
        try {
            // POST /zones/{zone_identifier}/email/routing/rules
            const [localPart] = email.split('@')
            // const domain = rest.join('@')

            const response = await this.request<{ id: string }>(
                `/zones/${zoneId}/email/routing/rules`,
                'POST',
                {
                    matchers: [{ type: 'literal', field: 'to', value: email }],
                    actions: [{ type: 'forward', value: [forwardTo] }],
                    name: `Forward ${localPart} to ${forwardTo}`,
                    enabled: true
                }
            )

            if (response.success) {
                return { success: true }
            }
            return { success: false, error: response.errors[0]?.message }
        } catch (error) {
            console.error('createEmailRule error:', error)
            return { success: false, error: 'Email kuralı oluşturulamadı' }
        }
    }

    async createStandardWebsiteDns(
        zoneId: string,
        domainName: string,
        serverIp: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            // Create A record for root domain (@)
            const rootResult = await this.createDnsRecord(zoneId, 'A', domainName, serverIp, 3600, undefined, true)
            if (!rootResult.success) {
                return { success: false, error: `Root A kaydı: ${rootResult.error}` }
            }

            // Create A record for www subdomain
            const wwwResult = await this.createDnsRecord(zoneId, 'A', `www.${domainName}`, serverIp, 3600, undefined, true)
            if (!wwwResult.success) {
                // www already exists is not a critical error
                console.log('www subdomain warning:', wwwResult.error)
            }

            return { success: true }
        } catch (error) {
            console.error('createStandardWebsiteDns error:', error)
            return { success: false, error: 'DNS kayıtları oluşturulamadı' }
        }
    }

    // ==========================================
    // DOMAIN REGISTRAR - CHECK AVAILABILITY
    // ==========================================

    async getAccountId(): Promise<string | null> {
        try {
            const response = await this.request<Array<{ id: string }>>('/accounts')
            if (response.success && response.result.length > 0) {
                return response.result[0].id
            }
            return null
        } catch (error) {
            console.error('getAccountId error:', error)
            return null
        }
    }

    async checkDomainAvailability(domain: string): Promise<{
        available: boolean
        premium: boolean
        price?: number
        currency?: string
        error?: string
    }> {
        try {
            const accountId = await this.getAccountId()
            if (!accountId) {
                return { available: false, premium: false, error: 'Hesap bulunamadı' }
            }

            // Check if domain is available for registration
            const response = await this.request<{
                available: boolean
                premium: boolean
                can_register: boolean
            }>(`/accounts/${accountId}/registrar/domains/${domain}/check`)

            if (!response.success) {
                return {
                    available: false,
                    premium: false,
                    error: response.errors[0]?.message || 'Kontrol edilemedi'
                }
            }

            return {
                available: response.result.available && response.result.can_register,
                premium: response.result.premium,
            }
        } catch (error) {
            console.error('checkDomainAvailability error:', error)
            return { available: false, premium: false, error: 'API hatası' }
        }
    }

    // ==========================================
    // DOMAIN REGISTRAR - GET PRICING
    // ==========================================

    async getDomainPricing(tld: string): Promise<{
        registerPrice?: number
        renewPrice?: number
        currency?: string
        error?: string
    }> {
        try {
            const accountId = await this.getAccountId()
            if (!accountId) {
                return { error: 'Hesap bulunamadı' }
            }

            // Get TLD pricing
            const response = await this.request<Array<{
                name: string
                registration_fee: number
                renewal_fee: number
            }>>(`/accounts/${accountId}/registrar/tlds`)

            if (!response.success) {
                return { error: response.errors[0]?.message }
            }

            const tldInfo = response.result.find(t => t.name === tld.replace('.', ''))
            if (!tldInfo) {
                return { error: 'Bu uzantı desteklenmiyor' }
            }

            return {
                registerPrice: tldInfo.registration_fee,
                renewPrice: tldInfo.renewal_fee,
                currency: 'USD',
            }
        } catch (error) {
            console.error('getDomainPricing error:', error)
            return { error: 'Fiyat alınamadı' }
        }
    }

    // ==========================================
    // DOMAIN REGISTRAR - REGISTER DOMAIN
    // ==========================================

    async registerDomain(
        domain: string,
        years: number = 1,
        contactInfo: {
            firstName: string
            lastName: string
            organization?: string
            address: string
            city: string
            state?: string
            postalCode: string
            country: string
            phone: string
            email: string
        }
    ): Promise<{ success: boolean; domain?: RegisteredDomain; error?: string }> {
        try {
            const accountId = await this.getAccountId()
            if (!accountId) {
                return { success: false, error: 'Hesap bulunamadı' }
            }

            // First check availability
            const availCheck = await this.checkDomainAvailability(domain)
            if (!availCheck.available) {
                return { success: false, error: 'Domain müsait değil' }
            }

            // Register the domain
            const response = await this.request<{
                name: string
                expires_at: string
                registered_at: string
            }>(`/accounts/${accountId}/registrar/domains`, 'POST', {
                name: domain,
                years: years,
                auto_renew: true,
                privacy: true,
                registrant: {
                    first_name: contactInfo.firstName,
                    last_name: contactInfo.lastName,
                    organization: contactInfo.organization || '',
                    address: contactInfo.address,
                    city: contactInfo.city,
                    state: contactInfo.state || '',
                    zip: contactInfo.postalCode,
                    country: contactInfo.country,
                    phone: contactInfo.phone,
                    email: contactInfo.email,
                },
            })

            if (response.success) {
                return { success: true, domain: response.result }
            }

            return { success: false, error: response.errors[0]?.message || 'Kayıt başarısız' }
        } catch (error) {
            console.error('registerDomain error:', error)
            return { success: false, error: 'API hatası' }
        }
    }

    // ==========================================
    // DOMAIN REGISTRAR - LIST REGISTERED DOMAINS
    // ==========================================

    async listRegisteredDomains(): Promise<Array<{
        name: string
        status: string
        expires_at: string
        auto_renew: boolean
    }>> {
        try {
            const accountId = await this.getAccountId()
            if (!accountId) return []

            const response = await this.request<Array<{
                name: string
                status: string
                expires_at: string
                auto_renew: boolean
            }>>(`/accounts/${accountId}/registrar/domains`)

            if (response.success) {
                return response.result
            }
            return []
        } catch (error) {
            console.error('listRegisteredDomains error:', error)
            return []
        }
    }
}

// ==========================================
// SINGLETON HELPER
// ==========================================

import { prisma } from '@/lib/prisma'
import { decryptSensitive, isEncrypted } from '@/lib/auth/crypto'

export async function getCloudflareService(): Promise<CloudflareService | null> {
    try {
        // 1. Önce environment variable'dan kontrol et
        const envToken = process.env.CLOUDFLARE_API_TOKEN
        if (envToken) {
            return new CloudflareService(envToken)
        }

        // 2. Yoksa database'den al
        const config = await prisma.apiConfig.findUnique({
            where: { provider: 'CLOUDFLARE' },
        })

        if (config?.apiKey) {
            // Decrypt if encrypted
            const apiKey = isEncrypted(config.apiKey)
                ? decryptSensitive(config.apiKey)
                : config.apiKey
            return new CloudflareService(apiKey)
        }

        return null
    } catch (error) {
        console.error('getCloudflareService error:', error)
        return null
    }
}

export function getDefaultServerIp(): string {
    return process.env.DEFAULT_SERVER_IP || ''
}
