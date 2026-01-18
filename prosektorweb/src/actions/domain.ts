'use server'

import { z } from 'zod'

// ==========================================
// TYPES
// ==========================================

export interface DomainCheckResult {
    domain: string
    extension: string
    available: boolean
    price?: number
    renewalPrice?: number
    premium?: boolean
    error?: string
}

export interface DomainSearchResult {
    success: boolean
    results: DomainCheckResult[]
    error?: string
}

// ==========================================
// PRICING (Manuel - Reseller olmadan)
// ==========================================

const DOMAIN_PRICES: Record<string, { register: number, renewal: number }> = {
    '.com': { register: 299, renewal: 350 },
    '.com.tr': { register: 99, renewal: 120 },
    '.net': { register: 350, renewal: 400 },
    '.org': { register: 350, renewal: 400 },
    '.net.tr': { register: 99, renewal: 120 },
    '.org.tr': { register: 99, renewal: 120 },
}

// ==========================================
// WHOIS CHECK - .com domains
// ==========================================

async function checkComDomain(domain: string): Promise<boolean> {
    try {
        // RDAP (Registration Data Access Protocol) - free and official
        const response = await fetch(`https://rdap.verisign.com/com/v1/domain/${domain}`, {
            method: 'GET',
            headers: { 'Accept': 'application/rdap+json' },
        })

        // 404 = domain available, 200 = domain taken
        if (response.status === 404) {
            return true // Available
        }
        return false // Taken
    } catch (error) {
        // If RDAP fails, try alternative method
        try {
            const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=NS`)
            const data = await dnsResponse.json()

            // If no NS records, likely available
            if (data.Status === 3 || !data.Answer) {
                return true
            }
            return false
        } catch {
            // Can't determine, assume taken
            return false
        }
    }
}

// ==========================================
// WHOIS CHECK - .com.tr domains
// ==========================================

async function checkComTrDomain(domain: string): Promise<boolean> {
    try {
        // NIC.tr doesn't have public RDAP, use DNS check
        const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=NS`)
        const data = await dnsResponse.json()

        // If no NS records found, likely available
        if (data.Status === 3 || !data.Answer) {
            return true
        }
        return false
    } catch {
        // Can't determine, assume taken for safety
        return false
    }
}

// ==========================================
// MAIN SEARCH FUNCTION
// ==========================================

const DomainSchema = z.string()
    .min(2, 'Alan adı en az 2 karakter olmalı')
    .max(63, 'Alan adı en fazla 63 karakter olabilir')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/, 'Geçersiz alan adı formatı')

export async function searchDomains(query: string): Promise<DomainSearchResult> {
    try {
        // Clean the query - remove spaces as you type
        let cleanQuery = query.toLowerCase().trim()

        // Remove any existing extension
        cleanQuery = cleanQuery.replace(/\.(com|net|org|tr|com\.tr|net\.tr|org\.tr)$/i, '')

        // Remove www. prefix if present
        cleanQuery = cleanQuery.replace(/^www\./i, '')

        // Validate
        const validated = DomainSchema.safeParse(cleanQuery)
        if (!validated.success) {
            return { success: false, results: [], error: validated.error.errors[0].message }
        }

        const baseDomain = validated.data
        const extensions = ['.com', '.com.tr']

        // Check all extensions in parallel
        const checks = await Promise.all(
            extensions.map(async (ext): Promise<DomainCheckResult> => {
                const fullDomain = `${baseDomain}${ext}`
                const pricing = DOMAIN_PRICES[ext]

                try {
                    let available: boolean

                    if (ext === '.com') {
                        available = await checkComDomain(fullDomain)
                    } else if (ext === '.com.tr') {
                        available = await checkComTrDomain(fullDomain)
                    } else {
                        available = false
                    }

                    return {
                        domain: fullDomain,
                        extension: ext,
                        available,
                        price: pricing?.register,
                        renewalPrice: pricing?.renewal,
                    }
                } catch (error) {
                    return {
                        domain: fullDomain,
                        extension: ext,
                        available: false,
                        error: 'Kontrol edilemedi',
                    }
                }
            })
        )

        return { success: true, results: checks }
    } catch (error) {
        console.error('searchDomains error:', error)
        return { success: false, results: [], error: 'Arama sırasında hata oluştu.' }
    }
}

// ==========================================
// SAVE DOMAIN INQUIRY
// ==========================================

import { prisma } from '@/lib/prisma'

export async function saveDomainInquiry(domain: string, companyId?: string) {
    try {
        // For now, just log it. Later we can create a DomainInquiry table
        console.log('Domain inquiry:', { domain, companyId, timestamp: new Date() })
        return { success: true }
    } catch (error) {
        console.error('saveDomainInquiry error:', error)
        return { success: false }
    }
}
