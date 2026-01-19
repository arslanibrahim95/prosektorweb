import Link from 'next/link'
import { Shield, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <Shield className="w-10 h-10" />
                </div>

                <h1 className="text-7xl font-bold mb-4">404</h1>
                <h2 className="text-2xl font-semibold mb-4">Sayfa Bulunamadı</h2>
                <p className="text-white/60 mb-8">
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition"
                    >
                        <Home className="w-4 h-4" />
                        Ana Sayfa
                    </Link>
                    <Link
                        href="/blog"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Blog&apos;a Git
                    </Link>
                </div>
            </div>
        </div>
    )
}
