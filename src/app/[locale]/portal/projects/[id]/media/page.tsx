import { getProjectById } from '@/features/auth/actions/portal'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { MediaLibrary } from '@/features/projects/components/portal/media/MediaLibrary'

export default async function MediaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = await getProjectById(id)
    if (!project) notFound()

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href={`/portal/projects/${id}`}
                    className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Projeye Dön
                </Link>
                <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
                    <ImageIcon className="w-6 h-6 text-brand-600" />
                    Medya Kütüphanesi
                </h1>
                <p className="text-neutral-500 mt-1">{project.name}</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <MediaLibrary />
            </div>
        </div>
    )
}
