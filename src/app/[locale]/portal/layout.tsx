import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from 'next/link'
import {
    LayoutDashboard, Layers, Receipt, Ticket, LogOut, Building2,
    Globe, FileText, Settings, Clock, CreditCard, BarChart3
} from 'lucide-react'
import { logoutAction } from '@/features/auth/actions/auth'
import { prisma } from '@/lib/prisma'
import Particles from '@/components/ui/Particles'

async function getCompanyName(companyId: string | null) {
    if (!companyId) return null
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true }
    })
    return company?.name
}

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const companyId = session?.user?.companyId
    const companyName = await getCompanyName(companyId || null)

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col relative overflow-hidden">
            {/* Background Particles */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                <Particles
                    particleColors={['#ef4444', '#dc2626', '#b91c1c']}
                    particleCount={100}
                    particleSpread={10}
                    speed={0.05}
                    particleBaseSize={100}
                    moveParticlesOnHover={false}
                    alphaParticles={false}
                    disableRotation={false}
                />
            </div>

            {/* Admin Impersonation Banner */}
            {session?.user?.role === 'ADMIN' && (
                <div className="bg-purple-600 text-white px-4 py-2 text-sm font-bold flex items-center justify-between z-50 sticky top-0">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        <span>SİMÜLASYON MODU: Şu an <u>{companyName}</u> olarak sistemdesiniz.</span>
                    </div>
                    <form action={async () => {
                        'use server'
                        const { exitImpersonation } = await import('@/features/system/actions/admin-ops')
                        await exitImpersonation()
                    }}>
                        <button className="bg-white text-purple-600 px-3 py-1 rounded text-xs font-extrabold hover:bg-purple-50 transition-colors">
                            YÖNETİME DÖN
                        </button>
                    </form>
                </div>
            )}

            <div className="flex flex-1 z-10">
                {/* Sidebar */}
                <aside className="w-64 bg-slate-900/90 backdrop-blur-xl text-white fixed h-full z-20 hidden md:flex flex-col mt-0 md:mt-0 border-r border-white/10" style={{ marginTop: session?.user?.role === 'ADMIN' ? '0' : '0' }}>
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white">
                                <Building2 className="w-5 h-5" />
                            </span>
                            <div className="overflow-hidden">
                                <h2 className="text-lg font-bold text-white truncate">
                                    {companyName || 'Portal'}
                                </h2>
                                <p className="text-xs text-neutral-400">Müşteri Paneli</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {/* Ana Bölümler */}
                        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Ana Menü</p>

                        <Link href="/portal" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <LayoutDashboard className="w-5 h-5" />
                            Özet
                        </Link>
                        <Link href="/portal/projects" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <Layers className="w-5 h-5" />
                            Projelerim
                        </Link>
                        <Link href="/portal/tickets" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <Ticket className="w-5 h-5" />
                            Destek
                        </Link>

                        {/* Hizmetler */}
                        <p className="px-4 py-2 mt-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Hizmetler</p>

                        <Link href="/portal/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <BarChart3 className="w-5 h-5" />
                            Site Analitiği
                        </Link>
                        <Link href="/portal/services" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <Clock className="w-5 h-5" />
                            Aboneliklerim
                        </Link>
                        <Link href="/portal/domains" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <Globe className="w-5 h-5" />
                            Domainlerim
                        </Link>

                        {/* Finansal */}
                        <p className="px-4 py-2 mt-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Finansal</p>

                        <Link href="/portal/invoices" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <Receipt className="w-5 h-5" />
                            Faturalar
                        </Link>
                        <Link href="/portal/proposals" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <FileText className="w-5 h-5" />
                            Teklifler
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
                        <form action={logoutAction}>
                            <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                                <LogOut className="w-4 h-4" />
                                Çıkış Yap
                            </button>
                        </form>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 md:ml-64 p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
