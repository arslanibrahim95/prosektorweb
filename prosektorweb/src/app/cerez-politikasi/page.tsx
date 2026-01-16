import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = {
    title: 'Çerez Politikası | ProSektorWeb',
    description: 'ProSektorWeb Çerez (Cookie) Politikası ve kullanım detayları.',
}

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-[1200px] mx-auto px-[5%] py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black tracking-tighter text-gray-900 no-underline">
                        psw
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-semibold transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <main className="pt-32 pb-24 px-[5%]">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-black mb-8 text-gray-900">ÇEREZ (COOKIE) POLİTİKASI</h1>

                    <div className="prose prose-lg max-w-none prose-gray
                        prose-headings:font-bold prose-headings:text-gray-900
                        prose-p:text-gray-600 prose-p:leading-relaxed
                        prose-li:text-gray-600
                        prose-strong:text-gray-900
                    ">

                        <section className="mb-8">
                            <h2>1. Çerez Nedir?</h2>
                            <p>
                                Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır.
                                Bu dosyalar, web sitesinin doğru ve güvenli şekilde çalışmasını sağlar.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2>2. Çerezlerin Kullanım Amaçları</h2>
                            <p>Prosektorweb olarak çerezleri aşağıdaki amaçlarla kullanırız:</p>
                            <ul>
                                <li>
                                    <strong>Oturum Yönetimi:</strong> Önizleme alanına güvenli erişim sağlanması ve oturumun devamlılığı.
                                </li>
                                <li>
                                    <strong>Hizmet Süreçlerinin İşletilmesi:</strong> Önizleme, doğrulama ve teknik süreçlerin sorunsuz çalışması.
                                </li>
                                <li>
                                    <strong>Platform Güvenliği:</strong> Yetkisiz erişimlerin önlenmesi ve sistem güvenliğinin sağlanması.
                                </li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2>3. Kullanılan Çerez Türleri</h2>

                            <h3 className="text-xl font-bold mt-6 mb-3">🔹 Zorunlu Çerezler</h3>
                            <p>
                                Bu çerezler, platformun temel işlevlerini yerine getirebilmesi için teknik olarak zorunludur.
                                Zorunlu çerezler olmadan önizleme alanına erişim sağlanamaz ve sistem düzgün çalışmayabilir.
                            </p>

                            <h3 className="text-xl font-bold mt-6 mb-3">🔹 Analitik Çerezler (İsteğe Bağlı)</h3>
                            <p>
                                Platform performansının ölçülmesi ve kullanıcı deneyiminin iyileştirilmesi amacıyla anonim istatistiksel veriler toplanabilir.
                                Bu çerezler yalnızca kullanıcının açık rızası ile kullanılır.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2>4. Çerezlerin Kontrolü</h2>
                            <p>
                                Kullanıcılar, tarayıcı ayarları üzerinden çerezleri kontrol edebilir veya silebilir.
                                Zorunlu çerezlerin devre dışı bırakılması durumunda platformun bazı bölümleri beklenen şekilde çalışmayabilir.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2>5. Veri Güvenliği</h2>
                            <p>
                                Çerezler aracılığıyla elde edilen veriler, KVKK Aydınlatma Metni’nde belirtilen ilkelere uygun olarak işlenir.
                                Bu veriler reklam veya pazarlama amacıyla üçüncü kişilerle paylaşılmaz.
                            </p>
                        </section>

                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-500">
                        Son Güncelleme: 2026
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#F7F7F9] py-12 border-t border-gray-200">
                <div className="max-w-[1200px] mx-auto px-[5%] text-center text-sm text-gray-400">
                    © 2026 ProSektorWeb. Tüm hakları saklıdır.
                </div>
            </footer>
        </div>
    )
}
