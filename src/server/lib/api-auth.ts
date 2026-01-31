import { auth } from '@/auth'
import { prisma } from '@/server/db'

/**
 * Gets companyId for API route authorization.
 * - ADMIN: can access any company's data (returns provided companyId or fetches from project)
 * - CLIENT: can only access own company's data
 */
export async function getApiCompanyId(): Promise<{ userId: string; companyId: string | null; isAdmin: boolean }> {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    if (session.user.role === 'ADMIN') {
        return { userId: session.user.id, companyId: null, isAdmin: true }
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true }
    })
    if (!user?.companyId) throw new Error('No company found')

    return { userId: session.user.id, companyId: user.companyId, isAdmin: false }
}

/**
 * Validates that a project exists and the user has access.
 * Admin can access any project; clients only their own.
 */
export async function validateProjectAccess(projectId: string, companyId: string | null, isAdmin: boolean) {
    const where: any = { id: projectId }
    if (!isAdmin && companyId) {
        where.companyId = companyId
    }

    const project = await prisma.webProject.findFirst({ where })
    if (!project) throw new Error('Project not found or access denied')
    return project
}
