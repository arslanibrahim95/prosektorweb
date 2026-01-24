import { ChevronDown } from 'lucide-react'

import { Container } from '@/components/ui/Container'

export function FAQ() {
    return (
        <section id="sss" className="py-24 relative z-0">
            <Container size="narrow">
                <h2 className="text-3xl font-bold mb-10 text-center text-neutral-900">Sık Sorulan Sorular</h2>
                <div className="space-y-4">
                    {[
                        { q: "Bu web sitesini gerçekten ücretsiz mi görebiliyorum?", a: "Evet, OSGB’nize özel hazırladığımız çalışmayı 7 gün boyunca hiçbir ücret ödemeden inceleyebilirsiniz. Karar verdiğinizde ödeme aşamasına geçilir." },
                        { q: "Web sitesi hazır mı, yoksa taslak mı gösteriyorsunuz?", a: "Size gönderdiğimiz önizleme kodu ile göreceğiniz site; logonuz, renkleriniz, iletişim bilgileriniz ve hizmetleriniz eklenmiş, yayına %90 hazır bir çalışmadır." },
                        { q: "İnceleme sürecinde düzenleme (revize) isteyebilir miyim?", a: "7 gün boyunca toplam 3 revize hakkınız vardır. Kapsam: metin düzenlemeleri, küçük görsel değişiklikleri, içerik hizalamaları." },
                        { q: "Satın alma sonrasında revize yapılabilir mi?", a: "Evet, ancak yayın sonrası yapılacak yeni sayfa ekleme veya yapısal değişiklik talepleri ek hizmet olarak ücretlendirilir." },
                        { q: "Ödeme nasıl yapılıyor?", a: "Kredi kartı ile güvenli ödeme altyapımız üzerinden veya banka havalesi seçeneği ile ödemenizi gerçekleştirebilirsiniz." }
                    ].map((faq, i) => (
                        <details key={i} className="group bg-neutral-50 rounded-lg border border-neutral-200 open:border-brand-200 transition-colors">
                            <summary className="flex items-center justify-between p-5 cursor-pointer font-bold text-neutral-800 group-hover:text-brand-700">
                                {faq.q}
                                <ChevronDown className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" />
                            </summary>
                            <div className="px-5 pb-5 text-neutral-600 leading-relaxed">
                                {faq.a}
                            </div>
                        </details>
                    ))}
                </div>
            </Container>
        </section>
    )
}
