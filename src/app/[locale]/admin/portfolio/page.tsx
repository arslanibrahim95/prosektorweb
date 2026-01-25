import { getPortfolios } from '@/features/projects/actions/portfolio'
import { PageHeader } from '@/components/admin/ui/PageHeader'
import Link from 'next/link'
import { Plus, ExternalLink, Star, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'

export default async function AdminPortfolioPage() {
    const portfolios = await getPortfolios()

    return (
        <div className="space-y-8">
            <PageHeader
                title="Portfolyo"
                description="Tamamlanan projeleri vitrine çevirin"
                action={{
                    label: "Yeni Ekle",
                    href: "/admin/portfolio/new",
                    icon: Plus
                }}
            />

            {portfolios.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                    <ImageIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="font-bold text-neutral-900 mb-2">Henüz vitrin yok</h3>
                    <p className="text-neutral-500 text-sm mb-6">
                        Tamamlanan projeleri portfolyoya ekleyerek müşterilerinize gösterin.
                    </p>
                    <Link
                        href="/admin/portfolio/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        İlk Projeyi Ekle
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolios.map((portfolio) => (
                        <Link
                            key={portfolio.id}
                            href={`/admin/portfolio/${portfolio.id}`}
                            className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all"
                        >
                            {/* Cover Image */}
                            <div className="aspect-video bg-neutral-100 relative overflow-hidden">
                                {portfolio.coverImage ? (
                                    <img
                                        src={portfolio.coverImage}
                                        alt={portfolio.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                        <ImageIcon className="w-12 h-12" />
                                    </div>
                                )}

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    {portfolio.isFeatured && (
                                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                            <Star className="w-3 h-3" /> Öne Çıkan
                                        </span>
                                    )}
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${portfolio.isPublished ? 'bg-green-500 text-white' : 'bg-neutral-700 text-neutral-200'}`}>
                                        {portfolio.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                        {portfolio.isPublished ? 'Yayında' : 'Taslak'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="font-bold text-neutral-900 mb-1 group-hover:text-brand-600 transition-colors">
                                    {portfolio.title}
                                </h3>
                                <p className="text-sm text-neutral-500 mb-3">
                                    {portfolio.webProject.company.name}
                                </p>

                                {portfolio.webProject.siteUrl && (
                                    <div className="flex items-center gap-1 text-xs text-brand-600">
                                        <ExternalLink className="w-3 h-3" />
                                        {portfolio.webProject.siteUrl.replace('https://', '')}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
