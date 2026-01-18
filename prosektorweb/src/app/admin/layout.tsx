import { auth, signOut } from "@/auth"
import Link from 'next/link'
import { LayoutDashboard, FileText, MessageSquare, LogOut, ExternalLink, Shield } from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    return (
        <div className="flex min-h-screen bg-neutral-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-neutral-200 fixed inset-y-0 left-0 z-50 shadow-sm flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-neutral-100">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center mr-3">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg font-serif text-neutral-900">Admin Panel</span>
                </div>

                {/* User Info */}
                <div className="p-6 border-b border-neutral-100">
                    <div className="text-xs font-bold text-neutral-400 uppercase mb-1">Giriş Yapılan Hesap</div>
                    <div className="font-bold text-neutral-900 truncate">{session?.user?.email}</div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-50 hover:text-brand-600 font-medium transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        Genel Bakış
                    </Link>
                    <Link href="/admin/blog" className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-50 hover:text-brand-600 font-medium transition-colors">
                        <FileText className="w-5 h-5" />
                        Blog Yönetimi
                    </Link>
                    <Link href="/admin/messages" className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-50 hover:text-brand-600 font-medium transition-colors">
                        <MessageSquare className="w-5 h-5" />
                        Mesajlar
                    </Link>
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-neutral-100 space-y-2">
                    <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-500 hover:text-neutral-900 text-sm font-medium transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        Siteyi Görüntüle
                    </a>

                    <form
                        action={async () => {
                            'use server'
                            await signOut({ redirectTo: '/login' })
                        }}
                    >
                        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full text-left font-medium transition-colors">
                            <LogOut className="w-5 h-5" />
                            Çıkış Yap
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
