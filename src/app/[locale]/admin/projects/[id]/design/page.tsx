import { getProject } from '@/features/projects/actions/projects'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Palette } from 'lucide-react'
import { DesignCustomizer } from '@/features/projects/components/portal/design/DesignCustomizer'

export default async function AdminDesignPage({ params }: { params: Promise<{ id: string }> }) {
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
                        <Palette className="w-6 h-6 text-pink-600" />
                        Tasarım Özelleştirme
                    </h1>
                    <p className="text-neutral-500 mt-0.5">{project.name} — {project.company?.name}</p>
                </div>
            </div>

            <DesignCustomizer projectId={id} />
        </div>
    )
}
