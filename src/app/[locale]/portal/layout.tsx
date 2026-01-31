import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from 'next/link'
import {
    LayoutDashboard, Layers, Receipt, Ticket, LogOut, Building2,
    Globe, FileText, Settings, Clock, CreditCard, BarChart3,
    Image as ImageIcon, BookOpen, Search, Palette
} from 'lucide-react'
import { logoutAction } from '@/features/auth/actions/auth'
import { prisma } from '@/server/db'
import Particles from '@/components/ui/Particles'
import { getTranslations } from 'next-intl/server'

async function getCompanyName(companyId: string | null) {
    if (!companyId) return null
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true }
    })
    return company?.name
}

async function getFirstProjectId(companyId: string | null) {
    if (!companyId) return null
    const project = await prisma.webProject.findFirst({
        where: { companyId, status: { not: 'CANCELLED' } },
        select: { id: true },
        orderBy: { updatedAt: 'desc' }
    })
    return project?.id || null
}

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const companyId = session?.user?.companyId
    const companyName = await getCompanyName(companyId || null)
    const firstProjectId = await getFirstProjectId(companyId || null)
    const t = await getTranslations('Portal')

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
                        <span>
                            {t.rich('simulation_banner', {
                                company: companyName || 'Simülasyon',
                                u: (chunks) => <u>{chunks}</u>
                            })}
                        </span>
                    </div>
                    <form action={async () => {
                        'use server'
                        const { exitImpersonation } = await import('@/features/system/actions/admin-ops')
                        await exitImpersonation()
                    }}>
                        <button className="bg-white text-purple-600 px-3 py-1 rounded text-xs font-extrabold hover:bg-purple-50 transition-colors">
                            {t('simulation_exit')}
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
                                <p className="text-xs text-neutral-400">{t('customer_panel')}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {/* Ana Bölümler */}
                        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('menu_main')}</p>

                        <Link href="/portal" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <LayoutDashboard className="w-5 h-5" />
                            {t('dashboard')}
                        </Link>
                        <Link href="/portal/projects" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <Layers className="w-5 h-5" />
                            {t('projects')}
                        </Link>
                        <Link href="/portal/tickets" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <Ticket className="w-5 h-5" />
                            {t('tickets')}
                        </Link>

                        {/* Hizmetler */}
                        <p className="px-4 py-2 mt-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('menu_services')}</p>

                        <Link href="/portal/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <BarChart3 className="w-5 h-5" />
                            {t('analytics')}
                        </Link>
                        <Link href="/portal/services" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <Clock className="w-5 h-5" />
                            {t('subscription')}
                        </Link>
                        <Link href="/portal/domains" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <Globe className="w-5 h-5" />
                            {t('domains')}
                        </Link>

                        {/* Site Yönetimi */}
                        {firstProjectId && (
                            <>
                                <p className="px-4 py-2 mt-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('menu_site_management')}</p>

                                <Link href={`/portal/projects/${firstProjectId}/media`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                                    <ImageIcon className="w-5 h-5" />
                                    {t('media')}
                                </Link>
                                <Link href={`/portal/projects/${firstProjectId}/blog`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                                    <BookOpen className="w-5 h-5" />
                                    {t('blog')}
                                </Link>
                                <Link href={`/portal/projects/${firstProjectId}/seo`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                                    <Search className="w-5 h-5" />
                                    {t('seo')}
                                </Link>
                                <Link href={`/portal/projects/${firstProjectId}/design`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                                    <Palette className="w-5 h-5" />
                                    {t('design')}
                                </Link>
                            </>
                        )}

                        {/* Finansal */}
                        <p className="px-4 py-2 mt-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t('menu_financial')}</p>

                        <Link href="/portal/invoices" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <Receipt className="w-5 h-5" />
                            {t('invoices')}
                        </Link>
                        <Link href="/portal/proposals" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                            <FileText className="w-5 h-5" />
                            {t('proposals')}
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
                                {t('logout')}
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
