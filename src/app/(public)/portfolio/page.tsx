import { getPortfolios } from '@/actions/portfolio'
import Link from 'next/link'
import { ArrowRight, ExternalLink, Quote } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default async function PublicPortfolioPage() {
    const portfolios = await getPortfolios(true) // Only published

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar variant="inner" />

            {/* Hero */}
            <section className="pt-32 pb-16 px-6 bg-white border-b border-neutral-200">
                <div className="max-w-6xl mx-auto text-center">
                    <span className="inline-block px-4 py-1.5 bg-brand-100 text-brand-700 rounded-full text-sm font-bold mb-6">
                        Portfolio
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black font-serif mb-6 text-neutral-900">
                        Başarı Hikayeleri
                    </h1>
                    <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                        OSGB'ler için tasarladığımız web sitelerinden örnekler
                    </p>
                </div>
            </section>

            {/* Portfolio Grid */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    {portfolios.length === 0 ? (
                        <div className="text-center py-20 text-neutral-400">
                            Yakında portfolio projelerimizi burada görebileceksiniz.
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-8">
                            {portfolios.map((portfolio, index) => (
                                <Link
                                    key={portfolio.id}
                                    href={`/portfolio/${portfolio.slug}`}
                                    className={`group bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300 ${portfolio.isFeatured && index === 0 ? 'md:col-span-2' : ''}`}
                                >
                                    <div className={`${portfolio.isFeatured && index === 0 ? 'md:flex' : ''}`}>
                                        {/* Image */}
                                        <div className={`aspect-video bg-neutral-100 relative overflow-hidden ${portfolio.isFeatured && index === 0 ? 'md:w-1/2 md:aspect-auto' : ''}`}>
                                            {portfolio.coverImage && (
                                                <img
                                                    src={portfolio.coverImage}
                                                    alt={portfolio.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className={`p-8 ${portfolio.isFeatured && index === 0 ? 'md:w-1/2 md:flex md:flex-col md:justify-center' : ''}`}>
                                            <p className="text-sm font-medium text-brand-600 mb-2">
                                                {portfolio.webProject.company.name}
                                            </p>
                                            <h3 className="text-2xl font-bold text-neutral-900 mb-3 group-hover:text-brand-600 transition-colors">
                                                {portfolio.title}
                                            </h3>
                                            <p className="text-neutral-600 mb-4 line-clamp-2">
                                                {portfolio.description}
                                            </p>

                                            {/* Technologies */}
                                            {portfolio.technologies && Array.isArray(portfolio.technologies) && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {(portfolio.technologies as string[]).slice(0, 4).map((tech) => (
                                                        <span key={tech} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Quote */}
                                            {portfolio.clientQuote && (
                                                <div className="flex items-start gap-2 p-4 bg-neutral-50 rounded-xl mb-4">
                                                    <Quote className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                                                    <p className="text-sm text-neutral-700 italic line-clamp-2">
                                                        "{portfolio.clientQuote}"
                                                    </p>
                                                </div>
                                            )}

                                            <span className="inline-flex items-center gap-2 text-brand-600 font-bold text-sm group-hover:underline">
                                                Detayları Gör <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer variant="inner" />
        </div>
    )
}
