import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'
import { SiteSettingsForm } from './SiteSettingsForm'

interface SettingsPageProps {
    params: Promise<{ id: string }>
}

export default async function ProjectSettingsPage({ params }: SettingsPageProps) {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true }
    })

    if (!user?.companyId) {
        redirect('/portal')
    }

    // Projeyi ve firma bilgilerini al
    const project = await prisma.webProject.findFirst({
        where: {
            id,
            companyId: user.companyId
        },
        include: {
            company: true
        }
    })

    if (!project) {
        notFound()
    }

    // Mevcut site ayarlarını al (varsa)
    const initialData = {
        phone: project.company.phone || '',
        email: project.company.email || '',
        address: project.company.address || '',
        workingHours: 'Pazartesi - Cuma: 09:00 - 18:00',
        socialMedia: {
            facebook: '',
            instagram: '',
            linkedin: '',
            twitter: '',
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/portal/projects/${id}`}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-neutral-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 font-serif flex items-center gap-2">
                        <Settings className="w-6 h-6 text-brand-600" />
                        Site Ayarları
                    </h1>
                    <p className="text-neutral-500">{project.name}</p>
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                    📍 Bu sayfada sitenizde görünecek iletişim bilgilerini düzenleyebilirsiniz.
                    Yapılan değişiklikler sitenize otomatik olarak yansıyacaktır.
                </p>
            </div>

            {/* Form */}
            <SiteSettingsForm projectId={id} initialData={initialData} />
        </div>
    )
}
