'use client'

import { useState } from 'react'
import { searchDomains, DomainCheckResult } from '@/actions/domain'
import {
    Search,
    Globe,
    CheckCircle2,
    XCircle,
    Loader2,
    ShoppingCart,
    Tag,
    RefreshCw,
    AlertCircle
} from 'lucide-react'

export default function DomainsPage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<DomainCheckResult[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setError('')
        setSearched(true)

        const result = await searchDomains(query)

        if (result.success) {
            setResults(result.results)
        } else {
            setError(result.error || 'Bir hata oluştu')
            setResults([])
        }

        setLoading(false)
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(price)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-900 font-serif">Domain Sorgulama</h1>
                <p className="text-neutral-500 mt-1">Müşterileriniz için uygun alan adlarını bulun</p>
            </div>

            {/* Search Box */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-8 shadow-xl">
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Globe className="w-6 h-6 text-brand-300 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Alan adı girin... (örn: firmaismi)"
                                className="w-full pl-14 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-brand-200 text-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="px-8 py-4 bg-white text-brand-600 rounded-xl font-bold text-lg hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                            Sorgula
                        </button>
                    </div>
                    <p className="text-brand-200 text-sm mt-3 text-center">
                        .com ve .com.tr uzantıları için anında sorgulama
                    </p>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Results */}
            {searched && !loading && results.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-neutral-900">Sonuçlar</h2>

                    <div className="grid gap-4">
                        {results.map((result) => (
                            <div
                                key={result.domain}
                                className={`bg-white rounded-xl border-2 p-6 transition-all ${result.available
                                        ? 'border-green-200 hover:border-green-300 hover:shadow-lg'
                                        : 'border-neutral-200 opacity-75'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {result.available ? (
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                                                <XCircle className="w-6 h-6 text-neutral-400" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-xl font-bold text-neutral-900">{result.domain}</div>
                                            <div className="text-sm text-neutral-500 flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${result.available
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-neutral-100 text-neutral-500'
                                                    }`}>
                                                    {result.available ? 'Müsait' : 'Alınmış'}
                                                </span>
                                                <span className="text-neutral-400">{result.extension}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {result.available && result.price && (
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Tag className="w-4 h-4 text-brand-600" />
                                                <span className="text-2xl font-bold text-brand-600">
                                                    {formatPrice(result.price)}
                                                </span>
                                                <span className="text-sm text-neutral-400">/yıl</span>
                                            </div>
                                            {result.renewalPrice && (
                                                <div className="text-xs text-neutral-400 flex items-center gap-1 justify-end">
                                                    <RefreshCw className="w-3 h-3" />
                                                    Yenileme: {formatPrice(result.renewalPrice)}/yıl
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {result.available && (
                                        <button className="ml-4 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg shadow-green-600/30">
                                            <ShoppingCart className="w-5 h-5" />
                                            Satın Al
                                        </button>
                                    )}
                                </div>

                                {result.error && (
                                    <p className="text-sm text-neutral-400 mt-2">{result.error}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!searched && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
                    <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Globe className="w-10 h-10 text-brand-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Domain Aramaya Başlayın</h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                        Yukarıdaki arama kutusuna istediğiniz alan adını yazın.
                        Uzantı eklemenize gerek yok, .com ve .com.tr otomatik olarak kontrol edilecek.
                    </p>
                </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="text-3xl font-bold text-brand-600 mb-2">
                        {formatPrice(DOMAIN_PRICES['.com'].register)}
                    </div>
                    <div className="font-bold text-neutral-900">.com</div>
                    <div className="text-sm text-neutral-500">Global alan adı</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="text-3xl font-bold text-brand-600 mb-2">
                        {formatPrice(DOMAIN_PRICES['.com.tr'].register)}
                    </div>
                    <div className="font-bold text-neutral-900">.com.tr</div>
                    <div className="text-sm text-neutral-500">Türkiye alan adı</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="text-3xl font-bold text-green-600 mb-2">Ücretsiz</div>
                    <div className="font-bold text-neutral-900">DNS Yönetimi</div>
                    <div className="text-sm text-neutral-500">Tüm domainlerde</div>
                </div>
            </div>
        </div>
    )
}

// Price reference for the component
const DOMAIN_PRICES: Record<string, { register: number }> = {
    '.com': { register: 299 },
    '.com.tr': { register: 99 },
}
