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
                        KULLANIM KOŞULLARI ve MESAFELİ SATIŞ SÖZLEŞMESİ
                    </h1>

                    <div className="prose prose-lg max-w-none prose-gray
                        prose-headings:font-bold prose-headings:text-gray-900
                        prose-p:text-gray-600 prose-p:leading-relaxed
                        prose-li:text-gray-600
                        prose-strong:text-gray-900
                    ">

                        {/* BÖLÜM 1: KULLANIM KOŞULLARI */}
                        <div className="mb-16">
                            <h2 className="text-2xl font-black text-[#8B1E1E] mb-6">BÖLÜM 1 – KULLANIM KOŞULLARI</h2>
                            <p className="italic text-sm text-gray-500 mb-6">
                                Bu metin, Prosektorweb platformu üzerinden sunulan web sitesi önizleme ve yayına alma hizmetlerinin kullanım şartlarını düzenler.
                                Platforma erişim sağlayan gerçek veya tüzel kişiler (“Kullanıcı”), aşağıda belirtilen koşulları kabul etmiş sayılır.
                            </p>

                            <section className="mb-8">
                                <h3>1. Hizmetin Kapsamı</h3>
                                <p>
                                    Prosektorweb, OSGB’lere özel olarak hazırlanmış AKSİYON ve VİZYON paketleri kapsamında web sitesi önizlemesi sunar.
                                    Sunulan önizlemeler, kullanıcının satın alma kararı vermesini kolaylaştırmak amacıyla oluşturulmuş gerçek web siteleridir.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h3>2. Önizleme Süresi</h3>
                                <p>Önizleme alanı, ilk erişim anından itibaren 7 gün (168 saat) süreyle aktiftir.</p>
                                <p>Bu süre içerisinde kullanıcı:</p>
                                <ul>
                                    <li>web sitesini inceleyebilir,</li>
                                    <li>düzenleme talebinde bulunabilir,</li>
                                    <li>yayına alma kararını verebilir.</li>
                                </ul>
                                <p>Önizleme süresi sonunda erişim otomatik olarak sona erer ve tasarım arşivlenir.</p>
                            </section>

                            <section className="mb-8">
                                <h3>3. Yeniden Aktifleştirme</h3>
                                <p>Önizleme süresi sona eren tasarımlar, talep edilmesi hâlinde yeniden aktifleştirilebilir.</p>
                                <p>Yeniden aktifleştirme işlemleri:</p>
                                <ul>
                                    <li>güncel fiyatlandırma,</li>
                                    <li>güncel hizmet koşulları</li>
                                </ul>
                                <p>üzerinden gerçekleştirilir. İlk önizleme süresine ait fiyat veya koşullar bu aşamada geçerliliğini yitirir.</p>
                            </section>

                            <section className="mb-8">
                                <h3>4. Yayına Alma</h3>
                                <p>Kullanıcı, önizleme süresi içerisinde seçtiği tasarımı satın alarak yayına alma talebinde bulunur.</p>
                                <p>Ödeme tamamlandıktan sonra:</p>
                                <ul>
                                    <li>seçilen web sitesi yayına alma sürecine alınır,</li>
                                    <li>alan adı bağlantıları ve temel teknik ayarlar yapılır,</li>
                                    <li>Seçilen web sitesi; ALICI tarafından alan adı (domain) ve hosting bilgilerinin SATICI’ya eksiksiz olarak iletilmesini takiben, teknik hazırlıkların tamamlanması ve gerekli yönlendirmelerin yapılmasının ardından en geç 24 saat içerisinde yayına alınır.</li>
                                </ul>
                                <p>Alan adı (domain) ve hosting hizmetleri, web sitesi hizmet bedeline dahil değildir; bu hizmetler bulunmaması hâlinde ALICI tarafından temin edilir.</p>
                            </section>

                            <section className="mb-8">
                                <h3>5. Revize ve Değişiklikler</h3>
                                <p>Önizleme süresi boyunca iletilen düzenleme talepleri, belirlenen revize hakkı kapsamında değerlendirilir.</p>
                                <p>Web sitesinin yayına alınmasının ardından talep edilen yeni düzenlemeler, yapısal değişiklikler veya ek fonksiyonlar ek hizmet kapsamında ele alınır ve ayrıca ücretlendirilir.</p>
                            </section>

                            <section className="mb-8">
                                <h3>6. Fikri Mülkiyet Hakları</h3>
                                <p>Önizleme süresi boyunca sunulan tüm tasarım, içerik ve yazılımların fikri mülkiyeti Prosektorweb’e aittir.</p>
                                <p>Kullanıcı, ödeme tamamlanmadan önce bu içerikleri:</p>
                                <ul>
                                    <li>kopyalayamaz,</li>
                                    <li>çoğaltamaz,</li>
                                    <li>üçüncü kişilerle paylaşamaz.</li>
                                </ul>
                                <p>Yayına alınan web sitesinin kullanım hakkı, ödeme tamamlandıktan sonra kullanıcıya devredilir.</p>
                            </section>

                            <section className="mb-8">
                                <h3>7. Kullanım ve Güvenlik</h3>
                                <p>Önizleme alanına ait erişim bilgilerinin üçüncü kişilerle paylaşılması yasaktır.</p>
                                <p>Yetkisiz erişim, kötüye kullanım veya güvenlik ihlali tespit edilmesi hâlinde Prosektorweb, erişimi askıya alma veya sonlandırma hakkını saklı tutar.</p>
                            </section>

                            <section className="mb-8">
                                <h3>8. Sorumluluğun Sınırlandırılması</h3>
                                <p>Prosektorweb, önizleme süresinin kullanıcı tarafından takip edilmemesi veya sürenin sona ermesi nedeniyle erişimin kapanmasından doğabilecek sonuçlardan sorumlu tutulamaz.</p>
                            </section>

                            <section className="mb-8">
                                <h3>9. Değişiklikler</h3>
                                <p>Prosektorweb, gerekli gördüğü hâllerde Kullanım Koşulları üzerinde değişiklik yapma hakkını saklı tutar.</p>
                                <p>Güncel metin platform üzerinden yayınlanır.</p>
                            </section>

                            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-[#8B1E1E]">
                                <p className="font-bold text-gray-900 mb-0">Özet:</p>
                                <p className="mb-0">Önizleme süresi, yayına alma ve yeniden aktifleştirme koşullarını okudum ve kabul ediyorum.</p>
                            </div>
                        </div>

                        {/* BÖLÜM 2: MESAFELİ SATIŞ SÖZLEŞMESİ */}
                        <div>
                            <h2 className="text-2xl font-black text-[#8B1E1E] mb-6">BÖLÜM 2 – MESAFELİ SATIŞ SÖZLEŞMESİ</h2>

                            <section className="mb-8">
                                <h3>1. Taraflar</h3>
                                <p>İşbu Mesafeli Satış Sözleşmesi (“Sözleşme”);</p>

                                <div className="bg-gray-50 p-6 rounded-xl mb-4">
                                    <h4 className="font-bold mb-2 mt-0">SATICI</h4>
                                    <p className="mb-1"><strong>Unvan:</strong> Prosektorweb Dijital Teknoloji Merkezi</p>
                                    <p className="mb-0"><strong>E-posta:</strong> hello@prosektorweb.com</p>
                                </div>

                                <p className="text-center font-bold my-2">ile</p>

                                <div className="bg-gray-50 p-6 rounded-xl mb-4">
                                    <h4 className="font-bold mb-2 mt-0">ALICI</h4>
                                    <p className="mb-0">Prosektorweb platformu üzerinden hizmet satın alan gerçek veya tüzel kişi</p>
                                </div>

                                <p>arasında, elektronik ortamda akdedilmiştir.</p>
                            </section>

                            <section className="mb-8">
                                <h3>2. Sözleşmenin Konusu</h3>
                                <p>
                                    İşbu sözleşmenin konusu;
                                    ALICI’nın, Prosektorweb tarafından sunulan OSGB’ye özel web sitesi yayına alma hizmetini satın almasına ilişkin tarafların hak ve yükümlülüklerinin belirlenmesidir.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h3>3. Hizmetin Tanımı</h3>
                                <p>Sunulan hizmet;</p>
                                <p>
                                    ALICI için önizleme süreci tamamlanmış olan AKSİYON veya VİZYON paketlerinden birinin seçilerek yayına alınmasını kapsayan kişiye özel dijital hizmettir.
                                    Önizleme sürecinde sunulan web sitesi, satın alma kararı verilmesi hâlinde aynı yapı ve içerikle yayına alınır.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h3>4. Fiyatlandırma ve Geçerlilik</h3>
                                <ul>
                                    <li>Hizmet bedeli, satın alma ekranında belirtilen tutar üzerinden uygulanır.</li>
                                    <li>Önizleme süresi boyunca sunulan fiyat, yalnızca bu süre için geçerlidir.</li>
                                    <li>Önizleme süresi sona erdiğinde tanıtım koşulları geçerliliğini yitirir.</li>
                                    <li>Süresi sona ermiş önizlemelerin yeniden aktifleştirilmesi hâlinde, güncel fiyatlandırma ve hizmet koşulları uygulanır.</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h3>5. İfa ve Teslim</h3>
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
                                <h3>6. Cayma Hakkı</h3>
                                <p>
                                    6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca;
                                    kişiye özel olarak hazırlanan ve elektronik ortamda anında ifa edilen dijital hizmetlerde cayma hakkı bulunmamaktadır.
                                </p>
                                <p>
                                    ALICI, ödeme adımına geçmeden önce bu durumu bildiğini ve kabul ettiğini beyan eder.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h3>7. Revize ve Ek Hizmetler</h3>
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
                                <h3>8. Fikri Mülkiyet Hakları</h3>
                                <p>
                                    Önizleme süreci boyunca sunulan tüm tasarım, içerik ve yazılımlar Prosektorweb’e aittir.
                                </p>
                                <p>Ödeme tamamlanmadan önce bu içerikler;</p>
                                <ul>
                                    <li>kopyalanamaz</li>
                                    <li>çoğaltılamaz</li>
                                    <li>üçüncü kişilerle paylaşamaz</li>
                                </ul>
                                <p>Yayına alınan web sitesinin kullanım hakkı, ödeme tamamlandıktan sonra ALICI’ya devredilir.</p>
                            </section>

                            <section className="mb-8">
                                <h3>9. Yürürlük</h3>
                                <p>
                                    ALICI, satın alma ekranında yer alan onay kutusunu işaretleyerek işbu sözleşmenin tüm hükümlerini okuduğunu ve kabul ettiğini beyan eder.
                                </p>
                                <p>Sözleşme, elektronik ortamda onaylandığı anda yürürlüğe girer.</p>
                            </section>
                        </div>

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
