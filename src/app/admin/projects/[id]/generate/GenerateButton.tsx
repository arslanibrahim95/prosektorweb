'use client';

/**
 * Generate Button Component
 * İçerik üretme butonları
 */

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateAllContent, generatePageContent } from '@/actions/generate';
import type { ContentType } from '@/lib/ai/types';

interface GenerateButtonProps {
    projectId: string;
    variant: 'all' | 'single';
    contentType?: ContentType;
    onComplete?: () => void;
}

export function GenerateButton({
    projectId,
    variant,
    contentType,
    onComplete,
}: GenerateButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);

        try {
            if (variant === 'all') {
                const result = await generateAllContent(projectId);
                if (!result.success) {
                    setError(result.errors?.join(', ') || 'Üretim başarısız');
                }
            } else if (contentType) {
                const result = await generatePageContent(projectId, contentType);
                if (!result.success) {
                    setError(result.error || 'Üretim başarısız');
                }
            }
            onComplete?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Beklenmeyen hata');
        } finally {
            setLoading(false);
        }
    };

    if (variant === 'all') {
        return (
            <div className="flex flex-col items-end">
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-medium hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg shadow-brand-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Üretiliyor...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            Tüm İçerikleri Üret
                        </>
                    )}
                </button>
                {error && (
                    <p className="text-sm text-red-600 mt-2">{error}</p>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Sparkles className="w-4 h-4" />
            )}
            {loading ? 'Üretiliyor...' : 'Üret'}
        </button>
    );
}
