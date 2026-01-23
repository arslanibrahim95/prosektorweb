import { getGeneratedContents } from '@/actions/generate';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Sparkles,
    FileText,
    Home,
    Users,
    Settings,
    Phone,
    HelpCircle,
    CheckCircle2,
    Clock,
    XCircle,
    RefreshCw,
    Rocket,
} from 'lucide-react';
import { GenerateButton } from './GenerateButton';
import { ContentCard } from './ContentCard';
import { DeployButtons } from './DeployButtons';

interface GeneratePageProps {
    params: Promise<{ id: string }>;
}

const CONTENT_TYPES = [
    { type: 'HOMEPAGE', label: 'Anasayfa', icon: Home, description: 'Hero, hizmetler özeti, CTA' },
    { type: 'ABOUT', label: 'Hakkımızda', icon: Users, description: 'Firma hikayesi, misyon, vizyon' },
    { type: 'SERVICES', label: 'Hizmetler', icon: Settings, description: 'Tüm hizmetlerin detayları' },
    { type: 'CONTACT', label: 'İletişim', icon: Phone, description: 'İletişim bilgileri, form metni' },
    { type: 'FAQ', label: 'SSS', icon: HelpCircle, description: 'Sıkça sorulan sorular' },
];

export default async function GeneratePage({ params }: GeneratePageProps) {
    const { id } = await params;

    const project = await prisma.webProject.findUnique({
        where: { id },
        include: {
            company: true,
            domain: true,
            generatedContents: {
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!project) {
        notFound();
    }

    // İçerikleri type'a göre grupla
    const contentMap = new Map(
        project.generatedContents.map((c) => [c.contentType, c])
    );

    const stats = {
        total: project.generatedContents.length,
        approved: project.generatedContents.filter((c) => c.status === 'APPROVED').length,
        draft: project.generatedContents.filter((c) => c.status === 'DRAFT').length,
        rejected: project.generatedContents.filter((c) => c.status === 'REJECTED').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/projects/${id}`}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 font-serif">
                            İçerik Üretici
                        </h1>
                        <p className="text-neutral-500">{project.name}</p>
                    </div>
                </div>
                <GenerateButton projectId={id} variant="all" />
            </div>

            {/* Company Info Card */}
            <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-xl border border-brand-200 p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-neutral-900">{project.company.name}</h3>
                        <p className="text-sm text-neutral-600 mt-1">
                            AI, firma bilgilerinizi kullanarak profesyonel web sitesi içerikleri üretecek.
                            Her sayfa için SEO-uyumlu başlık ve meta açıklamalar da oluşturulacak.
                        </p>
                        <div className="flex gap-4 mt-3 text-sm">
                            {project.company.phone && (
                                <span className="text-neutral-500">📞 {project.company.phone}</span>
                            )}
                            {project.company.email && (
                                <span className="text-neutral-500">✉️ {project.company.email}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
                        <FileText className="w-4 h-4" />
                        Toplam
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Onaylı
                    </div>
                    <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center gap-2 text-yellow-600 text-sm mb-1">
                        <Clock className="w-4 h-4" />
                        Bekliyor
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
                        <XCircle className="w-4 h-4" />
                        Reddedilen
                    </div>
                    <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                </div>
            </div>

            {/* Deploy Section */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Rocket className="w-5 h-5 text-brand-600" />
                    <h2 className="text-lg font-bold text-neutral-900">Site Yayınlama</h2>
                </div>
                <DeployButtons
                    projectId={id}
                    hasDomain={!!project.domain}
                    approvedCount={stats.approved}
                />
            </div>

            {/* Content Cards */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">Sayfa İçerikleri</h2>
                <div className="grid gap-4">
                    {CONTENT_TYPES.map(({ type, label, icon: Icon, description }) => {
                        const content = contentMap.get(type as any);
                        return (
                            <ContentCard
                                key={type}
                                projectId={id}
                                contentType={type}
                                label={label}
                                description={description}
                                icon={Icon}
                                content={content}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
