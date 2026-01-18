import { auth, signOut } from "@/auth"
import Link from 'next/link'
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    LogOut,
    ExternalLink,
    Shield,
    Users,
    Building2,
    Layers,
    Settings,
    Bell,
    Search,
    ChevronDown
} from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    return (
        <div className="flex min-h-screen bg-neutral-100 font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-gradient-to-b from-neutral-900 to-neutral-800 fixed inset-y-0 left-0 z-50 flex flex-col">
                {/* Logo */}
                <div className="h-20 flex items-center px-6 border-b border-white/10">
                    <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-brand-600/30">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-lg text-white block leading-tight">ProSektorWeb</span>
                        <span className="text-xs text-neutral-400">Super Admin Panel</span>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-4 mx-4 mt-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm">
                            SA
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm truncate">Sistem Yöneticisi</div>
                            <div className="text-xs text-neutral-400 truncate">{session?.user?.email}</div>
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
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium transition-all shadow-sm">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>

                    {/* OSGB Modülleri */}
                    <div className="px-3 py-2 mt-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        OSGB Modülleri
                    </div>
                    <Link href="/admin/companies" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                        <Building2 className="w-5 h-5" />
                        Firmalar
                        <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">0</span>
                    </Link>
                    <Link href="/admin/workplaces" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                        <Layers className="w-5 h-5" />
                        İşyerleri
                    </Link>
                    <Link href="/admin/employees" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                        <Users className="w-5 h-5" />
                        Çalışanlar
                    </Link>

                    {/* İçerik */}
                    <div className="px-3 py-2 mt-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        İçerik & İletişim
                    </div>
                    <Link href="/admin/blog" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                        <FileText className="w-5 h-5" />
                        Blog Yazıları
                    </Link>
                    <Link href="/admin/messages" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
                        <MessageSquare className="w-5 h-5" />
                        Gelen Mesajlar
                        <span className="ml-auto text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">0</span>
                    </Link>

                    {/* Sistem */}
                    <div className="px-3 py-2 mt-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Sistem
                    </div>
                    <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-300 hover:bg-white/5 hover:text-white font-medium transition-all">
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

                    <form
                        action={async () => {
                            'use server'
                            await signOut({ redirectTo: '/login' })
                        }}
                    >
                        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 w-full text-left font-medium transition-colors">
                            <LogOut className="w-5 h-5" />
                            Çıkış Yap
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 ml-72">
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Ara... (Firma, Çalışan, İşyeri)"
                                className="pl-10 pr-4 py-2 bg-neutral-100 border-0 rounded-lg text-sm w-80 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="h-8 w-px bg-neutral-200"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                                SA
                            </div>
                            <span className="text-sm font-medium text-neutral-700">Admin</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
