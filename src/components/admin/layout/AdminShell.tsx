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
        <div className="flex min-h-screen bg-neutral-100 font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-72 bg-gradient-to-b from-neutral-900 to-neutral-800 
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
                        className="lg:hidden text-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
                        aria-label="Menüyü kapat"
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
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {/* Ana Menü */}
                    <div className="px-3 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Yönetim Paneli
                    </div>
                    <Link href="/admin" onClick={handleNavigation} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all shadow-sm ${isActive('/admin') && pathname === '/admin' ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>

                    {/* Generic Task Management */}
                    <Link href="/admin/tasks" onClick={handleNavigation} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all shadow-sm ${isActive('/admin/tasks') ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
                        <FolderKanban className="w-5 h-5" />
                        Görevler
                    </Link>

                    {/* Web Ajansı */}
                    <div className="px-3 py-2 mt-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Web Ajansı
                    </div>
                    <Link href="/admin/companies" onClick={handleNavigation} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/admin/companies') ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
                        <Users className="w-5 h-5" />
                        Müşteriler
                        <span className="ml-auto text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">CRM</span>
                    </Link>
                    <Link href="/admin/proposals" onClick={handleNavigation} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/admin/proposals') ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
                        <FileText className="w-5 h-5" />
                        Teklifler
                    </Link>
                    <Link href="/admin/projects" onClick={handleNavigation} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/admin/projects') ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
                        <LayoutDashboard className="w-5 h-5" />
                        Web Projeleri
                    </Link>
                    <Link href="/admin/domains" onClick={handleNavigation} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/admin/domains') ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
                        <Globe className="w-5 h-5" />
                        Domain Yönetimi
                    </Link>

                    {/* Finans */}
                    <div className="px-3 py-2 mt-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Finans
                    </div>
                    <Link href="/admin/invoices" onClick={handleNavigation} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/admin/invoices') ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
                        <Receipt className="w-5 h-5" />
                        Faturalar
                    </Link>
                    <Link href="/admin/services" onClick={handleNavigation} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/admin/services') ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
                        <RefreshCw className="w-5 h-5" />
                        Abonelikler
                    </Link>

                    {/* İçerik */}
                    <div className="px-3 py-2 mt-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        İçerik & Destek
                    </div>
                    <Link href="/admin/messages" onClick={handleNavigation} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/admin/messages') ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
                        <MessageSquare className="w-5 h-5" />
                        Gelen Mesajlar
                    </Link>
                    <Link href="/admin/tickets" onClick={handleNavigation} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/admin/tickets') ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
                        <Ticket className="w-5 h-5" />
                        Destek Talepleri
                    </Link>

                    {/* Sistem */}
                    <div className="px-3 py-2 mt-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Sistem
                    </div>
                    <Link href="/admin/system-users" onClick={handleNavigation} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/admin/system-users') ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
                        <Users className="w-5 h-5" />
                        Personel Yönetimi
                    </Link>
                    <Link href="/admin/audit" onClick={handleNavigation} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/admin/audit') ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
                        <History className="w-5 h-5" />
                        İşlem Geçmişi
                    </Link>
                    <Link href="/admin/settings" onClick={handleNavigation} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/admin/settings') ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
                        <Settings className="w-5 h-5" />
                        Ayarlar
                    </Link>
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white text-sm font-medium transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        Siteyi Görüntüle
                    </a>

                    <form action="/api/auth/signout" method="POST">
                        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 w-full text-left font-medium transition-colors">
                            <LogOut className="w-5 h-5" />
                            Çıkış Yap
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2 -ml-2 text-neutral-500 hover:bg-neutral-100 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                            onClick={() => setIsSidebarOpen(true)}
                            aria-label="Menüyü aç"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="relative hidden sm:block">
                            <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                            <input
                                type="text"
                                placeholder="Ara... (Firma, Çalışan, İşyeri)"
                                aria-label="Arama yap"
                                className="pl-10 pr-4 py-2 bg-neutral-100 border-0 rounded-lg text-sm w-80 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <button
                            className="relative p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                            aria-label="Bildirimler"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="h-8 w-px bg-neutral-200 hidden lg:block"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                                {userEmail ? userEmail[0].toUpperCase() : 'SA'}
                            </div>
                            <span className="text-sm font-medium text-neutral-700 hidden lg:block">Admin</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8 flex-1 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
