'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    LogOut,
    ExternalLink,
    Shield,
    Users,
    Settings,
    Bell,
    Search,
    ChevronDown,
    Receipt,
    Globe,
    ShoppingCart,
    Ticket,
    RefreshCw,
    Menu,
    X,
    FolderKanban,
    History
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AdminBreadcrumbs } from './AdminBreadcrumbs'
import { SystemHealthWidget } from './SystemHealthWidget'

interface AdminShellProps {
    children: React.ReactNode
    userEmail?: string
}

export function AdminShell({ children, userEmail }: AdminShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const pathname = usePathname()

    // Close sidebar when navigating on mobile
    const handleNavigation = () => {
        setIsSidebarOpen(false)
    }

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

    return (
        <div className="flex min-h-screen bg-background font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-72 bg-gradient-to-b from-neutral-900 to-neutral-800 dark:from-neutral-950 dark:to-neutral-900
                fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo & Close Button */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-brand-600/30">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-lg text-white block leading-tight">ProSektorWeb</span>
                            <span className="text-xs text-neutral-400">Super Admin Panel</span>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-white/50 hover:text-white"
                        aria-label="Close Sidebar"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-4 mx-4 mt-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm">
                            SA
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm truncate">Sistem Yöneticisi</div>
                            <div className="text-xs text-neutral-400 truncate">{userEmail}</div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-8 overflow-y-auto custom-scrollbar" aria-label="Yönetim paneli navigasyonu">
                    {/* OPERATIONAL WORKSPACE */}
                    <div className="space-y-1">
                        <div className="px-3 py-2 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
                            Operasyonel
                        </div>
                        <NavLink href="/admin" icon={LayoutDashboard} label="Dashboard" isActive={pathname === '/admin'} />
                        <NavLink href="/admin/tasks" icon={FolderKanban} label="Görevler" isActive={isActive('/admin/tasks')} />
                        <NavLink href="/admin/tickets" icon={Ticket} label="Destek Talepleri" isActive={isActive('/admin/tickets')} />
                    </div>

                    {/* AI AGENCY WORKSPACE */}
                    <div className="space-y-1">
                        <div className="px-3 py-2 text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            AI Ajansı
                            <div className="w-1 h-1 bg-brand-500 rounded-full animate-pulse" />
                        </div>
                        <NavLink href="/admin/companies" icon={Users} label="Müşteri Portföyü" isActive={isActive('/admin/companies')} badge="CRM" />
                        <NavLink href="/admin/projects" icon={LayoutDashboard} label="Web Projeleri" isActive={isActive('/admin/projects')} />
                        <NavLink href="/admin/proposals" icon={FileText} label="Teklifler" isActive={isActive('/admin/proposals')} />
                        <NavLink href="/admin/domains" icon={Globe} label="Domain Yönetimi" isActive={isActive('/admin/domains')} />
                    </div>

                    {/* FINANCIAL WORKSPACE */}
                    <div className="space-y-1">
                        <div className="px-3 py-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                            Finansal
                        </div>
                        <NavLink href="/admin/invoices" icon={Receipt} label="Faturalar" isActive={isActive('/admin/invoices')} />
                        <NavLink href="/admin/services" icon={RefreshCw} label="Abonelikler" isActive={isActive('/admin/services')} />
                    </div>

                    {/* SYSTEM WORKSPACE */}
                    <div className="space-y-1">
                        <div className="px-3 py-2 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
                            Sistem
                        </div>
                        <NavLink href="/admin/system-users" icon={Users} label="Personel" isActive={isActive('/admin/system-users')} />
                        <NavLink href="/admin/audit" icon={History} label="İşlem Geçmişi" isActive={isActive('/admin/audit')} />
                        <NavLink href="/admin/settings" icon={Settings} label="Ayarlar" isActive={isActive('/admin/settings')} />
                    </div>
                </nav>

                {/* PLATFORM HEALTH MONITOR */}
                <SystemHealthWidget />

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 flex items-center justify-between gap-2">
                    <a href="/" target="_blank" className="p-3 bg-white/5 rounded-xl text-neutral-400 hover:text-white transition-colors" title="Siteyi Görüntüle">
                        <ExternalLink className="w-5 h-5" />
                    </a>

                    <form action="/api/auth/signout" method="POST" className="flex-1">
                        <button className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 w-full font-bold text-sm transition-colors">
                            <LogOut className="w-5 h-5" />
                            Çıkış
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2 -ml-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
                            onClick={() => setIsSidebarOpen(true)}
                            aria-label="Open Sidebar"
                            aria-expanded={isSidebarOpen}
                        >
                            <Menu className="w-6 h-6" />
                        </button>


                        {/* Arama fonksiyonu şimdilik devre dışı - gelecekte implementasyon yapılacak
                        <div className="relative hidden sm:block">
                            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Ara... (Firma, Çalışan, İşyeri)"
                                className="pl-10 pr-4 py-2 bg-muted border-0 rounded-lg text-sm w-80 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        */}
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <ThemeToggle />
                        <button
                            className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            aria-label="Bildirimler"
                        >
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="h-8 w-px bg-border hidden lg:block"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                                {userEmail ? userEmail[0].toUpperCase() : 'SA'}
                            </div>
                            <span className="text-sm font-medium text-foreground hidden lg:block">Admin</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8 flex-1 overflow-x-hidden">
                    <AdminBreadcrumbs />
                    {children}
                </main>
            </div>
        </div>
    )
}

// --- SUB-COMPONENTS ---

function NavLink({ href, icon: Icon, label, isActive, badge }: any) {
    return (
        <Link
            href={href}
            className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all relative overflow-hidden
                ${isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }
            `}
        >
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-lg" />
            )}
            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-brand-400' : 'text-neutral-400 transition-colors group-hover:text-brand-400'}`} />
            <span className="flex-1 text-sm">{label}</span>
            {badge && (
                <span className="text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                    {badge}
                </span>
            )}
        </Link>
    )
}
