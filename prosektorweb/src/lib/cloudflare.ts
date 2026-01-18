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
            const body: any = { type, name, content, ttl }
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
            const body: any = { type, name, content, ttl }
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
    // HELPER: Create Standard Website DNS
    // ==========================================

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
}

// ==========================================
// SINGLETON HELPER
// ==========================================

import { prisma } from '@/lib/prisma'

export async function getCloudflareService(): Promise<CloudflareService | null> {
    try {
        const config = await prisma.apiConfig.findUnique({
            where: { provider: 'CLOUDFLARE' },
        })

        if (!config?.apiKey) {
            return null
        }

        return new CloudflareService(config.apiKey)
    } catch (error) {
        console.error('getCloudflareService error:', error)
        return null
    }
}
