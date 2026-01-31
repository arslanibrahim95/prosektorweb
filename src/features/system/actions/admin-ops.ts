'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { logAudit } from '@/shared/lib'
import { setCookie, deleteCookie } from '@/shared/lib/headers'
import { getClientIp } from '@/shared/lib/rate-limit'
import { headers } from 'next/headers'

export async function impersonateCompany(companyId: string) {
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const ipAddress = await getClientIp()
    const userAgent = (await headers()).get('user-agent') || undefined

    // Audit Log: Start Impersonation (DB-backed)
    await logAudit({
        action: 'UPDATE',
        entity: 'AdminOps',
        entityId: companyId,
        userId: session.user.id,
        details: { operation: 'IMPERSONATE_START', targetCompanyId: companyId },
        ipAddress,
        userAgent
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

    const ipAddress = await getClientIp()
    const userAgent = (await headers()).get('user-agent') || undefined

    // Audit Log: End Impersonation (DB-backed)
    await logAudit({
        action: 'UPDATE',
        entity: 'AdminOps',
        entityId: session.user.companyId || 'system',
        userId: session.user.id,
        details: { operation: 'IMPERSONATE_END' },
        ipAddress,
        userAgent
    })

    await deleteCookie('admin_view_company_id')

    redirect('/admin')
}
