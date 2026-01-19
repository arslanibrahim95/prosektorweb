import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from 'next/link'
import { LayoutDashboard, Layers, Receipt, Ticket, LogOut } from 'lucide-react'
import { signOut } from '@/auth' // We need to handle signout client-side or server-side? 
// Actually signOut in auth.ts is server-side friendly helper or we use client form.

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    // Safety check - though middleware/auth.config handles this
    if (!session || (session.user as any).role !== 'CLIENT') {
        // redirect('/login') // Let auth.config handle or allow admin?
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full z-10 hidden md:flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">P</span>
                        Müşteri Paneli
                    </h2>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <Link href="/portal" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                        <LayoutDashboard className="w-5 h-5" />
                        Özet
                    </Link>
                    <Link href="/portal/projects" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                        <Layers className="w-5 h-5" />
                        Projelerim
                    </Link>
                    <Link href="/portal/invoices" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                        <Receipt className="w-5 h-5" />
                        Faturalar
                    </Link>
                    <Link href="/portal/tickets" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                        <Ticket className="w-5 h-5" />
                        Destek
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-sm font-bold">
                            {session?.user?.name?.[0] || 'M'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                            <p className="text-xs text-neutral-400 truncate">{session?.user?.email}</p>
                        </div>
                    </div>
                    <form action={async () => {
                        'use server'
                        await signOut({ redirectTo: '/login' })
                    }}>
                        <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                            <LogOut className="w-4 h-4" />
                            Çıkış Yap
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
