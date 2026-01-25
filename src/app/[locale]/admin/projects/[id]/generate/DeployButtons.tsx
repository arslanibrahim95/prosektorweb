'use client';

/**
 * Deploy Button Component
 * Site export ve deploy butonları
 */

import { useState } from 'react';
import { Upload, Eye, Rocket, Loader2, CheckCircle2 } from 'lucide-react';
import { exportSite, createPreview, deploySite } from '@/features/projects/actions/deploy';

interface DeployButtonProps {
    projectId: string;
    hasDomain: boolean;
    approvedCount: number;
}

export function DeployButtons({ projectId, hasDomain, approvedCount }: DeployButtonProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [result, setResult] = useState<{ type: string; message: string } | null>(null);

    const canDeploy = approvedCount >= 3;

    const handleExport = async () => {
        setLoading('export');
        setResult(null);
        try {
            const res = await exportSite(projectId);
            if (res.success) {
                setResult({ type: 'success', message: `${res.files?.length || 0} dosya oluşturuldu` });
            } else {
                setResult({ type: 'error', message: res.error || 'Export başarısız' });
            }
        } catch (error) {
            setResult({ type: 'error', message: 'Beklenmeyen hata' });
        } finally {
            setLoading(null);
        }
    };

    const handlePreview = async () => {
        setLoading('preview');
        setResult(null);
        try {
            const res = await createPreview(projectId);
            if (res.success) {
                setResult({ type: 'success', message: `Preview oluşturuldu: ${res.previewUrl}` });
            } else {
                setResult({ type: 'error', message: res.error || 'Preview başarısız' });
            }
        } catch (error) {
            setResult({ type: 'error', message: 'Beklenmeyen hata' });
        } finally {
            setLoading(null);
        }
    };

    const handleDeploy = async () => {
        setLoading('deploy');
        setResult(null);
        try {
            const res = await deploySite(projectId);
            if (res.success) {
                setResult({ type: 'success', message: `Site yayında: ${res.siteUrl}` });
            } else {
                setResult({ type: 'error', message: res.error || 'Deploy başarısız' });
            }
        } catch (error) {
            setResult({ type: 'error', message: 'Beklenmeyen hata' });
        } finally {
            setLoading(null);
        }
    };

    if (!canDeploy) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-yellow-700 text-sm">
                    Deploy için en az <strong>3 onaylı sayfa</strong> gerekli.
                    <br />
                    Şu an: {approvedCount} onaylı sayfa
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleExport}
                    disabled={loading !== null}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                    {loading === 'export' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Upload className="w-4 h-4" />
                    )}
                    Export
                </button>

                <button
                    onClick={handlePreview}
                    disabled={loading !== null}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors disabled:opacity-50"
                >
                    {loading === 'preview' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Eye className="w-4 h-4" />
                    )}
                    Preview Oluştur
                </button>

                <button
                    onClick={handleDeploy}
                    disabled={loading !== null || !hasDomain}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    title={!hasDomain ? 'Domain atanmamış' : undefined}
                >
                    {loading === 'deploy' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Rocket className="w-4 h-4" />
                    )}
                    Yayınla
                </button>
            </div>

            {/* Result Message */}
            {result && (
                <div
                    className={`flex items-center gap-2 p-3 rounded-lg text-sm ${result.type === 'success'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                        }`}
                >
                    {result.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                    {result.message}
                </div>
            )}

            {!hasDomain && (
                <p className="text-sm text-neutral-500">
                    💡 Yayınlamak için projeye bir domain atayın.
                </p>
            )}
        </div>
    );
}
