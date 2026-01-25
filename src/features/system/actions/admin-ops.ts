'use server'

import { auth } from '@/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { logAudit } from '@/lib/audit'

export async function impersonateCompany(companyId: string) {
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    // Audit Log: Start Impersonation
    await logAudit({
        action: 'UPDATE', // Using UPDATE as we are changing session context
        entity: 'AdminOps',
        entityId: companyId,
        userId: session.user.id,
        details: { operation: 'IMPERSONATE_START', targetCompanyId: companyId }
    })

    // Set a cookie to indicate which company the admin acts as
    const cookieStore = await cookies()
    cookieStore.set('admin_view_company_id', companyId, {
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
        const cookieStore = await cookies()
        cookieStore.delete('admin_view_company_id')
        redirect('/login')
    }

    // Audit Log: End Impersonation
    await logAudit({
        action: 'UPDATE',
        entity: 'AdminOps',
        entityId: session.user.companyId || 'system',
        userId: session.user.id,
        details: { operation: 'IMPERSONATE_END' }
    })

    const cookieStore = await cookies()
    cookieStore.delete('admin_view_company_id')

    redirect('/admin')
}
