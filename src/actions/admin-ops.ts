'use server'

import { auth } from '@/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function impersonateCompany(companyId: string) {
    const session = await auth()

    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

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

    const cookieStore = await cookies()
    cookieStore.delete('admin_view_company_id')

    redirect('/admin')
}
