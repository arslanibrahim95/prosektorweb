'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getErrorMessage, getZodErrorMessage, logger } from '@/shared/lib'
import { setCookie, deleteCookie } from '@/shared/lib/headers'

export async function impersonateCompany(companyId: string) {
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    // Audit Log: Start Impersonation
    // Audit Log: Start Impersonation
    // TODO: Replace with new audit implementation
    logger.info({
        action: 'UPDATE', // Using UPDATE as we are changing session context
        entity: 'AdminOps',
        entityId: companyId,
        userId: session.user.id,
        details: { operation: 'IMPERSONATE_START', targetCompanyId: companyId }
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

    // Audit Log: End Impersonation
    // Audit Log: End Impersonation
    // TODO: Replace with new audit implementation
    logger.info({
        action: 'UPDATE',
        entity: 'AdminOps',
        entityId: session.user.companyId || 'system',
        userId: session.user.id,
        details: { operation: 'IMPERSONATE_END' }
    })

    await deleteCookie('admin_view_company_id')

    redirect('/admin')
}
