import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = {
    title: 'Mesafeli Satış Sözleşmesi | ProSektorWeb',
    description: 'ProSektorWeb Mesafeli Satış Sözleşmesi.',
}

export default function DistanceSalesAgreementPage() {
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
                    <h1 className="text-3xl md:text-4xl font-black mb-8 text-gray-900 border-b border-gray-100 pb-6">
                        MESAFELİ SATIŞ SÖZLEŞMESİ
                    </h1>

                    <div className="prose prose-lg max-w-none prose-gray
                        prose-headings:font-bold prose-headings:text-gray-900
                        prose-p:text-gray-600 prose-p:leading-relaxed
                        prose-li:text-gray-600
                        prose-strong:text-gray-900
                    ">

                        <section className="mb-8">
                            <h2>1. Taraflar</h2>
                            <p>İşbu Mesafeli Satış Sözleşmesi (“Sözleşme”);</p>

                            <div className="bg-gray-50 p-6 rounded-xl mb-4">
                                <h3 className="text-lg font-bold mb-2 mt-0">SATICI</h3>
                                <p className="mb-1"><strong>Unvan:</strong> Prosektorweb Dijital Teknoloji Merkezi</p>
                                <p className="mb-0"><strong>E-posta:</strong> hello@prosektorweb.com</p>
                            </div>

                            <p className="text-center font-bold my-2">ile</p>

                            <div className="bg-gray-50 p-6 rounded-xl mb-4">
                                <h3 className="text-lg font-bold mb-2 mt-0">ALICI</h3>
                                <p className="mb-0">Prosektorweb platformu üzerinden hizmet satın alan gerçek veya tüzel kişi</p>
                            </div>

                            <p>arasında, elektronik ortamda akdedilmiştir.</p>
                        </section>

                        <section className="mb-8">
                            <h2>2. Sözleşmenin Konusu</h2>
                            <p>
                                İşbu sözleşmenin konusu;
                                ALICI’nın, Prosektorweb tarafından sunulan OSGB’ye özel web sitesi yayına alma hizmetini satın almasına ilişkin tarafların hak ve yükümlülüklerinin belirlenmesidir.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2>3. Hizmetin Tanımı</h2>
                            <p>Sunulan hizmet;</p>
                            <p>
                                ALICI için önizleme süreci tamamlanmış olan AKSİYON veya VİZYON paketlerinden birinin seçilerek yayına alınmasını kapsayan kişiye özel dijital hizmettir.
                                Önizleme sürecinde sunulan web sitesi, satın alma kararı verilmesi hâlinde aynı yapı ve içerikle yayına alınır.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2>4. Fiyatlandırma ve Geçerlilik</h2>
                            <ul>
                                <li>Hizmet bedeli, satın alma ekranında belirtilen tutar üzerinden uygulanır.</li>
                                <li>Önizleme süresi boyunca sunulan fiyat, yalnızca bu süre için geçerlidir.</li>
                                <li>Önizleme süresi sona erdiğinde tanıtım koşulları geçerliliğini yitirir.</li>
                                <li>Süresi sona ermiş önizlemelerin yeniden aktifleştirilmesi hâlinde, güncel fiyatlandırma ve hizmet koşulları uygulanır.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2>5. İfa ve Teslim</h2>
                            <p>
                                ALICI’nın, “Web sitemi yayına al” adımı ile ödeme işlemini tamamlamasıyla hizmet ifasına başlanır.
                            </p>
                            <p>Seçilen web sitesi;</p>
                            <ul>
                                <li>teknik hazırlıkların tamamlanmasını takiben</li>
                                <li>alan adı bağlantıları yapılarak</li>
                                <li>en geç 24 saat içerisinde yayına alınır.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2>6. Cayma Hakkı</h2>
                            <p>
                                6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca;
                                kişiye özel olarak hazırlanan ve elektronik ortamda anında ifa edilen dijital hizmetlerde cayma hakkı bulunmamaktadır.
                            </p>
                            <p>
                                ALICI, ödeme adımına geçmeden önce bu durumu bildiğini ve kabul ettiğini beyan eder.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2>7. Revize ve Ek Hizmetler</h2>
                            <p>
                                Önizleme süreci kapsamında sunulan revize hakları, inceleme süresi ile sınırlıdır.
                            </p>
                            <p>Web sitesinin yayına alınmasının ardından talep edilen;</p>
                            <ul>
                                <li>yeni sayfa eklemeleri</li>
                                <li>yapısal değişiklikler</li>
                                <li>ek fonksiyon talepleri</li>
                            </ul>
                            <p>ek hizmet kapsamında değerlendirilir ve ayrıca ücretlendirilir.</p>
                        </section>

                        <section className="mb-8">
                            <h2>8. Fikri Mülkiyet Hakları</h2>
                            <p>
                                Önizleme süreci boyunca sunulan tüm tasarım, içerik ve yazılımlar Prosektorweb’e aittir.
                            </p>
                            <p>Ödeme tamamlanmadan önce bu içerikler;</p>
                            <ul>
                                <li>kopyalanamaz</li>
                                <li>çoğaltılamaz</li>
                                <li>üçüncü kişilerle paylaşılamaz</li>
                            </ul>
                            <p>Yayına alınan web sitesinin kullanım hakkı, ödeme tamamlandıktan sonra ALICI’ya devredilir.</p>
                        </section>

                        <section className="mb-8">
                            <h2>9. Yürürlük</h2>
                            <p>
                                ALICI, satın alma ekranında yer alan onay kutusunu işaretleyerek işbu sözleşmenin tüm hükümlerini okuduğunu ve kabul ettiğini beyan eder.
                            </p>
                            <p>Sözleşme, elektronik ortamda onaylandığı anda yürürlüğe girer.</p>
                        </section>

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
