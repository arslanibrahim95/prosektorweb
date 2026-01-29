'use client';

/**
 * Content Card Component
 * Üretilen içerik kartı
 */

import { useState } from 'react';
import {
    CheckCircle2,
    Clock,
    XCircle,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    Check,
    X,
    Sparkles,
    Loader2,
    type LucideIcon
} from 'lucide-react';
import { sanitizeHtml } from '@/shared/lib/security';
import { approveContent, rejectContent, generatePageContent } from '@/actions/generate';
import type { GeneratedContent } from '@prisma/client';
import type { ContentType } from '@/features/ai-generation/lib/ai/types';

interface ContentCardProps {
    projectId: string;
    contentType: string;
    label: string;
    description: string;
    icon: LucideIcon;
    content?: GeneratedContent | null;
}

const STATUS_CONFIG = {
    DRAFT: { label: 'Bekliyor', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
    APPROVED: { label: 'Onaylandı', color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
    REJECTED: { label: 'Reddedildi', color: 'text-red-600 bg-red-50', icon: XCircle },
    PUBLISHED: { label: 'Yayında', color: 'text-blue-600 bg-blue-50', icon: CheckCircle2 },
};

export function ContentCard({
    projectId,
    contentType,
    label,
    description,
    icon: Icon,
    content,
}: ContentCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const status = content ? STATUS_CONFIG[content.status] : null;
    const StatusIcon = status?.icon;

    const handleGenerate = async () => {
        setLoading(true);
        try {
            await generatePageContent(projectId, contentType as ContentType);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!content) return;
        setActionLoading('approve');
        try {
            await approveContent(content.id);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!content) return;
        setActionLoading('reject');
        try {
            await rejectContent(content.id);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRegenerate = async () => {
        setLoading(true);
        try {
            await generatePageContent(projectId, contentType as ContentType);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => content && setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900">{label}</h3>
                        <p className="text-sm text-neutral-500">{description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {content ? (
                        <>
                            <span
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status?.color}`}
                            >
                                {StatusIcon && <StatusIcon className="w-4 h-4" />}
                                {status?.label}
                            </span>
                            {expanded ? (
                                <ChevronUp className="w-5 h-5 text-neutral-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-neutral-400" />
                            )}
                        </>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleGenerate();
                            }}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                            {loading ? 'Üretiliyor...' : 'Üret'}
                        </button>
                    )}
                </div>
            </div>

            {/* Content Preview */}
            {expanded && content && (
                <div className="border-t border-neutral-200 p-4 space-y-4">
                    {/* Meta Info */}
                    <div className="flex gap-4 text-sm">
                        {content.metaTitle && (
                            <div className="flex-1">
                                <span className="text-neutral-500">Meta Başlık:</span>
                                <p className="font-medium text-neutral-900">{content.metaTitle}</p>
                            </div>
                        )}
                        {content.metaDescription && (
                            <div className="flex-1">
                                <span className="text-neutral-500">Meta Açıklama:</span>
                                <p className="font-medium text-neutral-900">{content.metaDescription}</p>
                            </div>
                        )}
                    </div>

                    {/* Content Preview */}
                    <div className="bg-neutral-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.content) }}
                        />
                    </div>

                    {/* Generation Info */}
                    <div className="flex items-center justify-between text-sm text-neutral-500">
                        <div className="flex items-center gap-4">
                            <span>Model: {content.modelUsed}</span>
                            {content.tokensUsed && <span>Token: {content.tokensUsed}</span>}
                            <span>
                                Üretildi: {new Date(content.generatedAt).toLocaleDateString('tr-TR')}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
                        {content.status === 'DRAFT' && (
                            <>
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading !== null}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading === 'approve' ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    Onayla
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading !== null}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading === 'reject' ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <X className="w-4 h-4" />
                                    )}
                                    Reddet
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleRegenerate}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 ml-auto"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            Yeniden Üret
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
