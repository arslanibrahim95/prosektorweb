import { prisma } from '@/server/db'
import { AuditAction as PrismaAuditAction, Prisma } from '@prisma/client'

// Re-export for those who want strict enum
export { PrismaAuditAction as AuditAction }

// Flexible string type for callers
export type AuditLogAction =
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'PAYMENT_SUCCESS'
    | 'PAYMENT_FAILED'
    | 'DOMAIN_SEARCH'
    | 'DOMAIN_PURCHASE'
    | 'SYSTEM_ERROR'
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | PrismaAuditAction

export async function createAuditLog(data: {
    action: AuditLogAction | string // Allow string for flexibility
    entity: string
    entityId?: string
    userId?: string
    details?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
}) {
    try {
        // Serialize details to ensure it's valid JSON (Handle circular references)
        const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key: string, value: unknown) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) {
                        return "[Circular]";
                    }
                    seen.add(value);
                }
                return value;
            };
        };

        const safeDetails = data.details
            ? JSON.parse(JSON.stringify(data.details, getCircularReplacer()))
            : {}

        await prisma.auditLog.create({
            data: {
                // Force cast to Prisma Enum - assumes caller passes valid string
                action: data.action as PrismaAuditAction,
                entity: data.entity,
                entityId: data.entityId,
                userId: data.userId,
                details: safeDetails,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent
            }
        })
    } catch (error) {
        // Fail-safe: Don't crash the app if logging fails, but log to console
        console.error('Failed to create audit log:', error)
    }
}

export const logAudit = createAuditLog

// Read logs for Admin Panel with Pagination
export async function getAuditLogs(options?: {
    page?: number
    limit?: number
    entity?: string
    action?: string
}) {
    const page = options?.page || 1
    const limit = options?.limit || 25
    const skip = (page - 1) * limit

    const where: Prisma.AuditLogWhereInput = {}
    if (options?.entity) where.entity = options.entity
    if (options?.action) where.action = options.action as PrismaAuditAction

    try {
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.auditLog.count({ where })
        ])

        return {
            logs,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        }
    } catch (error) {
        console.error('getAuditLogs error:', error)
        return { logs: [], total: 0, pages: 0, currentPage: 1 }
    }
}
