import Link from 'next/link'
import { Clock, Phone, Mail } from 'lucide-react'

export function DemoExpired({ companyName }: { companyName: string }) {
    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10 text-neutral-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">Demo Sureniz Doldu</h1>
                <p className="text-neutral-400 mb-8">
                    <span className="text-white font-semibold">{companyName}</span> icin olusturulan demo onizleme suresi sona ermistir.
                </p>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 mb-8">
                    <h2 className="text-lg font-bold text-white">Sitenizi canli yayina alin</h2>
                    <p className="text-neutral-400 text-sm">
                        Profesyonel web sitenizi ozel domain ile yayinlamak icin bizimle iletisime gecin.
                    </p>
                    <div className="space-y-3">
                        <a
                            href="tel:+902121234567"
                            className="flex items-center gap-3 p-3 bg-neutral-800 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
                        >
                            <Phone className="w-5 h-5 text-brand-500" />
                            <span className="text-sm">0212 123 45 67</span>
                        </a>
                        <a
                            href="mailto:info@prosektorweb.com"
                            className="flex items-center gap-3 p-3 bg-neutral-800 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
                        >
                            <Mail className="w-5 h-5 text-brand-500" />
                            <span className="text-sm">info@prosektorweb.com</span>
                        </a>
                    </div>
                </div>

                <Link
                    href="/"
                    className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                    ProSektorWeb Ana Sayfa
                </Link>
            </div>
        </div>
    )
}
