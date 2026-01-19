import { Settings, Bell, Shield, Database, Globe, Construction } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-900 font-serif">Ayarlar</h1>
                <p className="text-neutral-500 mt-1">Sistem yapılandırması ve tercihler</p>
            </div>

            {/* Coming Soon */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
                <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Construction className="w-10 h-10 text-neutral-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Geliştirme Aşamasında</h3>
                <p className="text-neutral-500 max-w-md mx-auto">
                    Sistem ayarları yakında aktif olacak. Şu an için .env dosyasından yapılandırma yapabilirsiniz.
                </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <div className="font-bold text-neutral-900">Veritabanı</div>
                            <div className="text-sm text-green-600">Bağlı</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <div className="font-bold text-neutral-900">Kimlik Doğrulama</div>
                            <div className="text-sm text-green-600">Aktif</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Globe className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <div className="font-bold text-neutral-900">Site</div>
                            <div className="text-sm text-green-600">prosektorweb.com</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
