import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = {
    title: 'Gizlilik Politikası ve KVKK | ProSektorWeb',
    description: 'ProSektorWeb Gizlilik Politikası ve KVKK Aydınlatma Metni.',
}

export default function PrivacyPolicyPage() {
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
                        GİZLİLİK POLİTİKASI ve KVKK AYDINLATMA METNİ
                    </h1>

                    <div className="prose prose-lg max-w-none prose-gray
                        prose-headings:font-bold prose-headings:text-gray-900
                        prose-p:text-gray-600 prose-p:leading-relaxed
                        prose-li:text-gray-600
                        prose-strong:text-gray-900
                    ">

                        {/* BÖLÜM 1 */}
                        <div className="mb-16">
                            <h2 className="text-2xl font-black text-[#8B1E1E] mb-6">BÖLÜM 1 – GİZLİLİK POLİTİKASI</h2>

                            <section className="mb-8">
                                <h3>1. Gizliliğe Yaklaşımımız</h3>
                                <p>
                                    <p>ProSektorWeb olarak (&quot;Biz&quot;, &quot;Şirket&quot;), gizliliğinize ve kişisel verilerinizin güvenliğine büyük önem veriyoruz.</p>
                                    Kullanıcılara ait kişisel veriler, firma bilgileri ve hizmet kapsamında paylaşılan içerikler gizli kabul edilir.
                                </p>
                                <p>Bu bilgiler;</p>
                                <ul>
                                    <li>izinsiz şekilde üçüncü kişilerle paylaşılmaz,</li>
                                    <li>ticari amaçlarla satılmaz,</li>
                                    <li>hizmet kapsamı dışında kullanılmaz.</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h3>2. Bilgilerin Kullanımı</h3>
                                <p>Platform üzerinden paylaşılan bilgiler yalnızca aşağıdaki amaçlarla kullanılır:</p>
                                <ul>
                                    <li>OSGB’ye özel web sitesi önizlemesinin oluşturulması</li>
                                    <li>Önizleme erişim kodunun üretilmesi ve iletilmesi</li>
                                    <li>Hizmet süreçlerinin yürütülmesi</li>
                                    <li>Kullanıcı ile iletişim kurulması</li>
                                    <li>Teknik güvenliğin sağlanması</li>
                                </ul>
                                <p>Bu kullanım, Prosektorweb’in sunduğu hizmetlerle sınırlıdır.</p>
                            </section>

                            <section className="mb-8">
                                <h3>3. Veri Güvenliği</h3>
                                <p>
                                    Kullanıcı verilerinin korunması amacıyla teknik ve idari güvenlik önlemleri uygulanır.
                                    Sistem erişimleri yetkilendirme esasına dayanır ve veriler güvenli altyapılar üzerinde saklanır.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h3>4. Ödeme Güvenliği</h3>
                                <p>
                                    Ödeme işlemleri sırasında kullanılan kart bilgileri Prosektorweb tarafından görüntülenmez veya saklanmaz.
                                    Tüm ödeme işlemleri, güvenli ödeme altyapıları üzerinden gerçekleştirilir.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h3>5. KVKK ile İlişki</h3>
                                <p>
                                    Kişisel verilerin işlenmesine ilişkin detaylı bilgiler aşağıda yer alan KVKK Aydınlatma Metni kapsamında sunulmaktadır.
                                    Bu Gizlilik Politikası, KVKK metninin yerine geçmez; genel yaklaşımı açıklamayı amaçlar.
                                </p>
                            </section>

                            <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-[#8B1E1E]">
                                <p className="font-bold text-gray-900 mb-0">Kısa Özet:</p>
                                <p className="mb-0">Prosektorweb, kullanıcı bilgilerini gizli tutar ve yalnızca hizmet sunumu amacıyla kullanır.</p>
                            </div>
                        </div>

                        {/* BÖLÜM 2 */}
                        <div>
                            <h2 className="text-2xl font-black text-[#8B1E1E] mb-6">BÖLÜM 2 – KVKK AYDINLATMA METNİ</h2>

                            <div className="mb-8 p-6 bg-gray-50 rounded-xl text-center">
                                <h3 className="text-lg font-bold mb-2">Veri Sorumlusu</h3>
                                <p className="font-bold text-xl mb-2">Prosektorweb Dijital Teknoloji Merkezi</p>
                                <p className="text-sm text-gray-500 mb-0">(“Veri Sorumlusu”)</p>
                            </div>

                            <p className="mb-8">
                                6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca kişisel verilerinizin güvenliği konusunda sizi bilgilendirmek isteriz.
                            </p>

                            <section className="mb-8">
                                <h3>1. İşlenen Kişisel Veriler</h3>
                                <p>Platform ve önizleme alanı üzerinden aşağıdaki kişisel veriler işlenmektedir:</p>

                                <h4 className="font-bold mt-4 mb-2">Kimlik ve İletişim Bilgileri</h4>
                                <ul className="mt-0">
                                    <li>Ad, soyad</li>
                                    <li>Telefon numarası</li>
                                    <li>E-posta adresi</li>
                                </ul>

                                <h4 className="font-bold mt-4 mb-2">Kullanıcı İşlem Bilgileri</h4>
                                <ul className="mt-0">
                                    <li>Önizleme erişim kodu</li>
                                    <li>Oturum ve giriş kayıtları</li>
                                    <li>Sistem üzerindeki işlem hareketleri</li>
                                </ul>

                                <h4 className="font-bold mt-4 mb-2">Firma Bilgileri</h4>
                                <ul className="mt-0">
                                    <li>Firma / OSGB adı</li>
                                    <li>Hizmet kapsamında paylaşılan sektörel bilgiler</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h3>2. Kişisel Verilerin İşlenme Amaçları</h3>
                                <p>Kişisel verileriniz, KVKK’nın 5. maddesinde belirtilen hukuki sebeplere dayanarak aşağıdaki amaçlarla işlenir:</p>
                                <ul>
                                    <li>OSGB’ye özel web sitesi önizlemesinin hazırlanması</li>
                                    <li>Önizleme erişiminin sağlanması</li>
                                    <li>İnceleme sürecinin (7 gün) yönetilmesi</li>
                                    <li>Hizmet süreçlerine ilişkin iletişimin yürütülmesi</li>
                                    <li>Platform güvenliğinin sağlanması</li>
                                    <li>Yetkisiz erişimlerin önlenmesi</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h3>3. Kişisel Verilerin Aktarılması</h3>
                                <p>Kişisel verileriniz;</p>
                                <ul>
                                    <li>Yasal yükümlülükler kapsamında yetkili kamu kurum ve kuruluşlarına</li>
                                    <li>Teknik altyapı hizmetleri kapsamında sınırlı olarak hizmet sağlayıcılara</li>
                                </ul>
                                <p>aktarılabilir. Kişisel veriler reklam veya pazarlama amacıyla üçüncü kişilerle paylaşılmaz.</p>
                            </section>

                            <section className="mb-8">
                                <h3>4. Kişisel Verilerin Saklanma Süresi</h3>
                                <ul className="list-none pl-0 space-y-4">
                                    <li className="pl-4 border-l-2 border-gray-200">
                                        <strong>Önizleme süresi boyunca:</strong><br />
                                        Veriler, önizleme erişimi aktif olduğu süre boyunca işlenir.
                                    </li>
                                    <li className="pl-4 border-l-2 border-gray-200">
                                        <strong>Satın alma gerçekleşmezse:</strong><br />
                                        Önizleme süresi sonunda veriler silinir veya anonim hâle getirilir.
                                    </li>
                                    <li className="pl-4 border-l-2 border-gray-200">
                                        <strong>Satın alma gerçekleşirse:</strong><br />
                                        Veriler, yasal yükümlülükler ve zamanaşımı süreleri boyunca saklanır.
                                    </li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h3>5. Veri Sahibi Olarak Haklarınız</h3>
                                <p>KVKK’nın 11. maddesi uyarınca;</p>
                                <ul>
                                    <li>kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                                    <li>düzeltilmesini veya silinmesini talep etme,</li>
                                    <li>işlenmesine itiraz etme</li>
                                </ul>
                                <p>haklarına sahipsiniz.</p>
                                <p className="mt-4">
                                    Taleplerinizi <a href="mailto:hello@prosektorweb.com" className="text-[#8B1E1E] font-bold no-underline hover:underline">hello@prosektorweb.com</a> adresi üzerinden iletebilirsiniz.
                                </p>
                            </section>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-500 italic">
                        Bu metin, gizlilik politikamız ve KVKK aydınlatma yükümlülüklerini birlikte sunmak amacıyla hazırlanmıştır.
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
