'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
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
 * Kritik işlemleri loglar.
 * Session'dan kullanıcı bilgisi alır.
 * Hata durumunda sessizce fail olur (işlemi bloklamaz).
 */
export async function logAudit({
    action,
    entity,
    entityId,
    details,
}: AuditLogParams): Promise<void> {
    try {
        const session = await auth()

        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                userId: session?.user?.id || null,
                userName: session?.user?.name || null,
                userEmail: session?.user?.email || null,
                details: details ? JSON.parse(JSON.stringify(details)) : null,
                // IP ve UserAgent server-side'da headers'dan alınabilir
                // Şimdilik null bırakıyoruz
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
