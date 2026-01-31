import { getProject } from '@/features/projects/actions/projects'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Image as ImageIcon } from 'lucide-react'
import { MediaLibrary } from '@/features/projects/components/portal/media/MediaLibrary'

export default async function AdminMediaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = await getProject(id) as any
    if (!project) notFound()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/admin/projects/${id}`}
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
                        <ImageIcon className="w-6 h-6 text-purple-600" />
                        Medya Kütüphanesi
                    </h1>
                    <p className="text-neutral-500 mt-0.5">{project.name} — {project.company?.name}</p>
                </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <MediaLibrary companyId={project.companyId} />
            </div>
        </div>
    )
}
