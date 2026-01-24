'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * Tenant isolation guard for multi-tenant security
 * Ensures users can only access resources belonging to their company
 */

export type TenantResource =
    | 'company'
    | 'invoice'
    | 'payment'
    | 'proposal'
    | 'project'
    | 'service'
    | 'ticket'
    | 'domain'
    | 'employee'
    | 'workplace'
    | 'note'
    | 'contact'
    | 'activity'

export class TenantAccessError extends Error {
    constructor(message: string = 'Bu kaynağa erişim yetkiniz yok.') {
        super(message)
        this.name = 'TenantAccessError'
    }
}

export class UnauthorizedError extends Error {
    constructor(message: string = 'Oturum açmanız gerekiyor.') {
        super(message)
        this.name = 'UnauthorizedError'
    }
}

/**
 * Get the company ID that owns a specific resource
 */
async function getResourceCompanyId(
    resourceType: TenantResource,
    resourceId: string
): Promise<string | null> {
    switch (resourceType) {
        case 'company':
            return resourceId // Company ID is the resource itself

        case 'invoice': {
            const invoice = await prisma.invoice.findUnique({
                where: { id: resourceId },
                select: { companyId: true }
            })
            return invoice?.companyId ?? null
        }

        case 'payment': {
            const payment = await prisma.payment.findFirst({
                where: { id: resourceId, deletedAt: null },
                select: { invoice: { select: { companyId: true } } }
            })
            return payment?.invoice?.companyId ?? null
        }

        case 'proposal': {
            const proposal = await prisma.proposal.findUnique({
                where: { id: resourceId },
                select: { companyId: true }
            })
            return proposal?.companyId ?? null
        }

        case 'project': {
            const project = await prisma.webProject.findUnique({
                where: { id: resourceId },
                select: { companyId: true }
            })
            return project?.companyId ?? null
        }

        case 'service': {
            const service = await prisma.service.findUnique({
                where: { id: resourceId },
                select: { companyId: true }
            })
            return service?.companyId ?? null
        }

        case 'ticket': {
            const ticket = await prisma.ticket.findUnique({
                where: { id: resourceId },
                select: { companyId: true }
            })
            return ticket?.companyId ?? null
        }

        case 'domain': {
            const domain = await prisma.domain.findUnique({
                where: { id: resourceId },
                select: { companyId: true }
            })
            return domain?.companyId ?? null
        }

        case 'employee': {
            const employee = await prisma.employee.findUnique({
                where: { id: resourceId },
                select: { workplace: { select: { companyId: true } } }
            })
            return employee?.workplace?.companyId ?? null
        }

        case 'workplace': {
            const workplace = await prisma.workplace.findUnique({
                where: { id: resourceId },
                select: { companyId: true }
            })
            return workplace?.companyId ?? null
        }

        case 'note': {
            const note = await prisma.companyNote.findUnique({
                where: { id: resourceId },
                select: { companyId: true }
            })
            return note?.companyId ?? null
        }

        case 'contact': {
            const contact = await prisma.companyContact.findUnique({
                where: { id: resourceId },
                select: { companyId: true }
            })
            return contact?.companyId ?? null
        }

        case 'activity': {
            const activity = await prisma.companyActivity.findUnique({
                where: { id: resourceId },
                select: { companyId: true }
            })
            return activity?.companyId ?? null
        }

        default:
            return null
    }
}

/**
 * Verify that the current user has access to a specific resource
 *
 * @param resourceType - Type of resource being accessed
 * @param resourceId - ID of the specific resource
 * @throws TenantAccessError if user doesn't have access
 * @throws UnauthorizedError if user is not authenticated
 */
export async function requireTenantAccess(
    resourceType: TenantResource,
    resourceId: string
): Promise<{ userId: string; userRole: string; userCompanyId: string | null }> {
    const session = await auth()

    if (!session?.user) {
        throw new UnauthorizedError()
    }

    const { id: userId, role: userRole, companyId: userCompanyId } = session.user

    // ADMIN role has access to all resources
    if (userRole === 'ADMIN') {
        return { userId, userRole, userCompanyId }
    }

    // For non-admin users, verify they own the resource
    const resourceCompanyId = await getResourceCompanyId(resourceType, resourceId)

    if (!resourceCompanyId) {
        throw new TenantAccessError('Kaynak bulunamadı.')
    }

    if (resourceCompanyId !== userCompanyId) {
        throw new TenantAccessError()
    }

    return { userId, userRole, userCompanyId }
}

/**
 * Verify that the current user can create resources for a specific company
 *
 * @param targetCompanyId - Company ID where resource will be created
 * @throws TenantAccessError if user doesn't have access to that company
 */
export async function requireCompanyAccess(
    targetCompanyId: string
): Promise<{ userId: string; userRole: string; userCompanyId: string | null }> {
    const session = await auth()

    if (!session?.user) {
        throw new UnauthorizedError()
    }

    const { id: userId, role: userRole, companyId: userCompanyId } = session.user

    // ADMIN can create resources for any company
    if (userRole === 'ADMIN') {
        return { userId, userRole, userCompanyId }
    }

    // Non-admin can only create resources for their own company
    if (targetCompanyId !== userCompanyId) {
        throw new TenantAccessError('Bu firma için kayıt oluşturamazsınız.')
    }

    return { userId, userRole, userCompanyId }
}

/**
 * Get current user's company ID for filtering queries
 * Returns null for ADMIN (meaning no filter needed)
 */
export async function getTenantFilter(): Promise<{
    userId: string
    userRole: string
    companyFilter: { companyId: string } | {}
}> {
    const session = await auth()

    if (!session?.user) {
        throw new UnauthorizedError()
    }

    const { id: userId, role: userRole, companyId } = session.user

    // ADMIN sees all - no filter
    if (userRole === 'ADMIN') {
        return { userId, userRole, companyFilter: {} }
    }

    // Non-admin sees only their company's data
    if (!companyId) {
        throw new TenantAccessError('Hesabınız bir firmaya bağlı değil.')
    }

    return {
        userId,
        userRole,
        companyFilter: { companyId }
    }
}
