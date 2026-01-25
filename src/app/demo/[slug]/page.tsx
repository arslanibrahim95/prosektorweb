import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function InstantDemoPage({ params }: { params: { slug: string } }) {
    const project = await prisma.webProject.findUnique({
        where: { slug: params.slug },
        include: {
            company: {
                include: {
                    invoices: true
                }
            }
        }
    })

    if (!project) {
        notFound()
    }

    // Check expiration
    const isExpired = project.previewEndsAt && new Date() > new Date(project.previewEndsAt)

    if (isExpired) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Demo Süresi Doldu</h1>
                    <p className="text-slate-600 mb-8">
                        Minimum seviyede tutulan bu önizleme sürümünün süresi dolmuştur.
                        <br />
                        Web sitenizi hemen yayınlamak için teklifinizi onaylayın.
                    </p>
                    <Link href="/contact" className="block w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition transform hover:scale-105">
                        Teklifi İncele / Satın Al
                    </Link>
                </div>
            </div>
        )
    }

    // Use Company Name or Project Name
    const companyName = project.company.name || project.name

    // TODO: In future, use generatedContents if available suitable for preview
    // For now, we use the deterministic dummy content but customized with real company name

    const services = [
        'İş Sağlığı ve Güvenliği',
        'Risk Analizi ve Değerlendirme',
        'Acil Durum Eylem Planı',
        'Yangın Eğitimi ve Tatbikatı',
        'Periyodik Kontroller',
        'Mobil Sağlık Hizmetleri'
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Top Bar - Demo Context */}
            <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-lg">
                <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-xs px-2 py-1 rounded font-bold">CANLI DEMO</span>
                    <span className="text-sm text-slate-300 hidden md:inline">
                        Bu bir önizlemedir: {project.slug}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {project.previewEndsAt && (
                        <div className="text-xs text-orange-400 font-mono hidden md:block">
                            Bitiş: {new Date(project.previewEndsAt).toLocaleDateString('tr-TR')}
                        </div>
                    )}
                    <Link href="/contact" className="bg-green-600 hover:bg-green-500 px-4 py-1.5 rounded text-sm font-medium transition-colors">
                        Sitemi Satın Al 🚀
                    </Link>
                </div>
            </div>

            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">{companyName}</h1>
                    <nav className="hidden md:flex gap-6 text-sm text-slate-600">
                        <span className="cursor-pointer hover:text-blue-600">Kurumsal</span>
                        <span className="cursor-pointer hover:text-blue-600">Hizmetlerimiz</span>
                        <span className="cursor-pointer hover:text-blue-600">Belgeler</span>
                        <span className="cursor-pointer hover:text-blue-600">İletişim</span>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative bg-slate-50 py-20 lg:py-32">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6">
                        {companyName} ile <br />
                        <span className="text-blue-600">Güvenli Yarınlar</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
                        İş yerinizde sağlık ve güvenliği en üst seviyeye taşıyoruz.
                        Profesyonel OSGB hizmetleri ile yasal uyumluluk ve sıfır iş kazası hedefi.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
                            Teklif Alın
                        </button>
                        <button className="bg-white border border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
                            Hizmetlerimiz
                        </button>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h3 className="text-2xl font-bold text-center mb-12">Hizmetlerimiz</h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        {services.map((service, i) => (
                            <div key={i} className="p-6 border rounded-xl hover:shadow-lg transition-shadow group">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-xl font-bold mb-2">{service}</h4>
                                <p className="text-slate-500 text-sm">
                                    {companyName} olarak {service.toLowerCase()} konusunda uzman kadromuzla hizmetinizdeyiz.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; {new Date().getFullYear()} {companyName}. Tüm hakları saklıdır.</p>
                    <p className="text-xs mt-4 text-slate-600">ProSektorWeb Altyapısı ile Hazırlanmıştır.</p>
                </div>
            </footer>
        </div>
    )
}
