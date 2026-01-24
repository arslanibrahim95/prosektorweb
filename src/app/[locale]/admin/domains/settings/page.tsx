import { getApiConfigs } from '@/actions/domain'
import Link from 'next/link'
import { ChevronLeft, Settings, Server, Key, Globe, Save } from 'lucide-react'
import { ApiConfigForm } from '@/components/admin/domain/ApiConfigForm'

export default async function DomainSettingsPage() {
    const configs = await getApiConfigs()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/domains"
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">API & Sunucu Ayarları</h1>
                    <p className="text-neutral-500 mt-1">Domain ve hosting API yapılandırmaları</p>
                </div>
            </div>

            {/* Server Config */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <Server className="w-5 h-5 text-brand-600" />
                    Varsayılan Sunucu
                </h2>
                <ApiConfigForm
                    provider="DEFAULT_SERVER"
                    name="Varsayılan Sunucu"
                    showServerOnly={true}
                    existing={configs.find(c => c.provider === 'DEFAULT_SERVER')}
                />
            </div>

            {/* Registrar APIs */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <Key className="w-5 h-5 text-brand-600" />
                    Registrar API Yapılandırmaları
                </h2>
                <p className="text-neutral-500 mb-6">
                    Domain sorgulama ve satın alma için registrar API anahtarlarını girin.
                    Reseller hesabınız yoksa sorgulama çalışır, satın alma özelliği için hesap gerekir.
                </p>

                <div className="space-y-6">
                    {/* İsimtescil */}
                    <div className="p-4 border border-neutral-200 rounded-xl">
                        <h3 className="font-bold text-neutral-900 mb-4">İsimtescil</h3>
                        <ApiConfigForm
                            provider="ISIMTESCIL"
                            name="İsimtescil"
                            existing={configs.find(c => c.provider === 'ISIMTESCIL')}
                        />
                    </div>

                    {/* Natro */}
                    <div className="p-4 border border-neutral-200 rounded-xl">
                        <h3 className="font-bold text-neutral-900 mb-4">Natro</h3>
                        <ApiConfigForm
                            provider="NATRO"
                            name="Natro"
                            existing={configs.find(c => c.provider === 'NATRO')}
                        />
                    </div>

                    {/* Cloudflare */}
                    <div className="p-4 border border-neutral-200 rounded-xl">
                        <h3 className="font-bold text-neutral-900 mb-4">Cloudflare (DNS Yönetimi)</h3>
                        <ApiConfigForm
                            provider="CLOUDFLARE"
                            name="Cloudflare"
                            existing={configs.find(c => c.provider === 'CLOUDFLARE')}
                        />
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-700 text-sm">
                <strong>Not:</strong> API anahtarları veritabanında saklanır. Üretim ortamında şifreleme yapılması önerilir.
            </div>
        </div>
    )
}
