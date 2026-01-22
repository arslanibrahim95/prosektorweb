'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { headers } from 'next/headers'
import { AuditAction } from '@prisma/client'

// ==========================================
// AUDIT LOG HELPER
// ==========================================

interface AuditLogParams {
    action: AuditAction
    entity: string
    entityId?: string
    details?: Record<string, unknown>
}

/**
 * Get client IP address from request headers.
 * Handles proxies (nginx, cloudflare) via x-forwarded-for.
 */
async function getClientInfo(): Promise<{ ipAddress: string; userAgent: string }> {
    try {
        const headersList = await headers()

        // Try x-forwarded-for first (for proxies), then x-real-ip, then fallback
        const forwardedFor = headersList.get('x-forwarded-for')
        const ipAddress = forwardedFor?.split(',')[0]?.trim() ||
            headersList.get('x-real-ip') ||
            'unknown'

        const userAgent = headersList.get('user-agent') || 'unknown'

        return { ipAddress, userAgent }
    } catch {
        // headers() might fail in some contexts (e.g., non-request context)
        return { ipAddress: 'unavailable', userAgent: 'unavailable' }
    }
}

/**
 * Kritik işlemleri loglar.
 * Session'dan kullanıcı bilgisi, headers'dan IP alır.
 * Hata durumunda sessizce fail olur (işlemi bloklamaz).
 */
export async function logAudit({
    action,
    entity,
    entityId,
    details,
}: AuditLogParams): Promise<void> {
    try {
        const [session, clientInfo] = await Promise.all([
            auth(),
            getClientInfo(),
        ])

        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                userId: session?.user?.id || null,
                userName: session?.user?.name || null,
                userEmail: session?.user?.email || null,
                details: details ? JSON.parse(JSON.stringify(details)) : undefined,
                ipAddress: clientInfo.ipAddress,
                userAgent: clientInfo.userAgent,
            },
        })
    } catch (error) {
        // Audit log hatası ana işlemi bloklamasın
        console.error('Audit log error:', error)
    }
}

// ==========================================
// QUERIES
// ==========================================

export async function getAuditLogs(options?: {
    entity?: string
    action?: AuditAction
    userId?: string
    page?: number
    limit?: number
}) {
    const { entity, action, userId, page = 1, limit = 20 } = options || {}
    const skip = (page - 1) * limit

    try {
        const where: Record<string, unknown> = {}

        if (entity) where.entity = entity
        if (action) where.action = action
        if (userId) where.userId = userId

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.auditLog.count({ where }),
        ])

        return {
            logs,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        }
    } catch (error) {
        console.error('getAuditLogs error:', error)
        return { logs: [], total: 0, pages: 0, currentPage: 1 }
    }
}
