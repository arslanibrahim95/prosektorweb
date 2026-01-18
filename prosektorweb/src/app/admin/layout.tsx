import { auth } from "@/auth"
import { redirect } from 'next/navigation'
import { AdminShell } from "@/components/admin/layout/AdminShell"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    return (
        <AdminShell userEmail={session.user.email || ''}>
            {children}
        </AdminShell>
    )
}
