import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DemoNavbar } from '@/features/projects/components/DemoNavbar'
import { DesignWrapper } from '@/features/projects/components/DesignWrapper'

export default async function DemoLayout({
    children,
    params
}: {
    children: React.ReactNode,
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const project = await prisma.webProject.findUnique({
        where: { slug },
        include: {
            company: true,
            generatedContents: {
                where: { contentType: 'DESIGN' },
                take: 1
            }
        }
    })

    if (!project) {
        notFound()
    }

    const designContent = project.generatedContents[0]?.content
    const companyName = project.company.name || project.name

    return (
        <div className="min-h-screen bg-white">
            {/* Top Bar - Demo Context (Shared across all demo pages) */}
            <div className="bg-neutral-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-[100] shadow-xl">
                <div className="flex items-center gap-3">
                    <span className="bg-brand-600 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Demo Sürümü</span>
                    <span className="text-sm text-neutral-400 font-medium hidden md:inline">
                        Bu bir önizlemedir: <span className="text-white">{project.name}</span>
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/contact" className="bg-emerald-600 hover:bg-emerald-500 px-5 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2">
                        Sitemi Satın Al 🚀
                    </Link>
                </div>
            </div>

            <DesignWrapper design={designContent}>
                <DemoNavbar companyName={companyName} slug={slug} />
                <main>{children}</main>

                {/* Footer */}
                <footer className="bg-neutral-950 text-neutral-500 py-16 border-t border-neutral-900">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-xl font-bold text-white mb-4">{companyName}</h2>
                        <p className="max-w-md mx-auto text-sm mb-8">
                            İş sağlığı ve güvenliğinde güvenilir çözüm ortağınız.
                        </p>
                        <div className="text-[10px] uppercase tracking-widest text-neutral-700 font-bold">
                            &copy; {new Date().getFullYear()} {companyName}. ProSektorWeb Altyapısı ile Hazırlanmıştır.
                        </div>
                    </div>
                </footer>
            </DesignWrapper>
        </div>
    )
}
