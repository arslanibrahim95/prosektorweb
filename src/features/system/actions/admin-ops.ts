'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getErrorMessage, getZodErrorMessage, logger } from '@/shared/lib'
import { setCookie, deleteCookie } from '@/shared/lib/headers'
import { createAuditLog } from '@/shared/lib/audit'

export async function impersonateCompany(companyId: string) {
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    // Audit Log: Start Impersonation (DB-backed)
    await createAuditLog({
        action: 'IMPERSONATE_START',
        entity: 'AdminOps',
        entityId: companyId,
        userId: session.user.id,
        details: { operation: 'IMPERSONATE_START', targetCompanyId: companyId },
        ipAddress: session.user.ipAddress,
        userAgent: session.user.userAgent
    })

    // Set a cookie to indicate which company the admin acts as
    await setCookie('admin_view_company_id', companyId, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 // 1 hour
    })

    redirect('/portal')
}

export async function exitImpersonation() {
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
        // Even if not admin, clear the cookie just in case
        await deleteCookie('admin_view_company_id')
        redirect('/login')
    }

    // Audit Log: End Impersonation (DB-backed)
    await createAuditLog({
        action: 'IMPERSONATE_END',
        entity: 'AdminOps',
        entityId: session.user.companyId || 'system',
        userId: session.user.id,
        details: { operation: 'IMPERSONATE_END' },
        ipAddress: session.user.ipAddress,
        userAgent: session.user.userAgent
    })

    await deleteCookie('admin_view_company_id')

    redirect('/admin')
}
