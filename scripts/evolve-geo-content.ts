
import 'dotenv/config'
import { prisma } from '@/server/db'
import { slugify } from '@/shared/lib/utils'

const GEO_CONTENT = {
    'is-guvenligi-uzmani-sorumluluk': `
        <h2>İSG Uzmanının Rolü: Danışman mı, Sorumlu mu?</h2>
        <p>İş güvenliği uzmanı, işverene rehberlik eden teknik bir danışmandır. Yasal olarak (6331 sayılı Kanun madde 8), işyerinde alınan önlemlerin nihai sorumlusu işverendir. Uzman, tespit ettiği eksiklikleri işverene bildirmekle yükümlüdür.</p>
        
        <h3>Yasal Sorumluluk Sınırları</h3>
        <p>Yargıtay 12. Ceza Dairesi'nin yerleşik içtihatlarına göre, bir iş kazasında İSG uzmanının sorumlu tutulabilmesi için:</p>
        <ul>
            <li>Kaza ile uzmanın görev ihlali arasında illiyet bağı olmalıdır.</li>
            <li>Uzman, tespit ettiği tehlikeyi deftere yazmamış olmalıdır.</li>
        </ul>

        <h3>Onaylı Defterin Hayati Önemi</h3>
        <p>İSG Katip sistemi veya noter onaylı defter, uzmanın "sigortasıdır". Tespit edilen her uygunsuzluk buraya yazılmalı ve işverene tebliğ edilmelidir. Yazıldığı andan itibaren sorumluluk işverene geçer.</p>
    `,
    'risk-degerlendirmesi-yontemleri': `
        <h2>Risk Analizi Yöntem Karşılaştırması</h2>
        <p>İşyerinizin tehlike sınıfına ve operasyonel yapısına göre doğru yöntemi seçmek, kazaları önlemenin ilk adımıdır.</p>

        <h3>1. L Tipi Matris (5x5)</h3>
        <p><strong>Nerede Kullanılır?</strong> Basit süreçli, az tehlikeli işyerleri (Ofisler, perakende mağazaları).</p>
        <p><strong>Avantajı:</strong> Uygulaması kolaydır, hızlı sonuç verir.</p>
        <p><strong>Formül:</strong> Risk = Olasılık x Şiddet</p>

        <h3>2. Fine-Kinney Metodu</h3>
        <p><strong>Nerede Kullanılır?</strong> Sanayi tesisleri, inşaatlar, çok tehlikeli sınıflar.</p>
        <p><strong>Avantajı:</strong> "Frekans" (Maruziyet) parametresini de hesaba katarak daha hassas sonuç verir.</p>
        <p><strong>Formül:</strong> Risk = Olasılık x Frekans x Şiddet</p>

        <h3>Hangisini Seçmelisiniz?</h3>
        <table border="1" style="width:100%; border-collapse: collapse; margin-top: 10px;">
            <tr style="background:#f3f4f6;"><th>Yöntem</th><th>Karmaşıklık</th><th>Hassasiyet</th></tr>
            <tr><td>L Tipi Matris</td><td>Düşük</td><td>Orta</td></tr>
            <tr><td>Fine-Kinney</td><td>Yüksek</td><td>Çok Yüksek</td></tr>
        </table>
    `,
    'isg-yazilimi-secimi': `
        <h2>Dijitalleşen OSGB: Yazılım Seçim Kriterleri</h2>
        <p>2026'da bir OSGB yazılımı sadece form doldurmamalı, operasyonu yönetmelidir. İşte aramanız gereken 4 temel özellik:</p>

        <h3>1. İSG-KATİP Entegrasyonu</h3>
        <p>Sözleşmelerinizi ve atamalarınızı otomatik çeken, bakanlık sunucularıyla anlık haberleşen bir sistem zorunluluktur.</p>

        <h3>2. Mobil Saha Uygulaması</h3>
        <p>Uzmanlar sahada denetim yaparken fotoğraf çekip, sesi metne çevirerek rapor yazabilmelidir. Ofise dönüp rapor yazma devri bitti.</p>

        <h3>3. E-Reçete ve E-İman</h3>
        <p>İşyeri hekimleri için Medula entegrasyonu ve e-imza uyumluluğu, yasal geçerlilik için şarttır.</p>

        <h3>4. Otomatik Hatırlatıcılar</h3>
        <p>"Eğitimi yaklaşanlar", "Muayenesi geçenler" gibi bildirimler, cezai durumlara düşmenizi engeller.</p>
    `,
    'acil-durum-tatbikati': `
        <h2>Adım Adım Acil Durum Tatbikatı</h2>
        <p>Yılda en az bir kez yapılması zorunlu (Çok tehlikelide 6 ay) olan tatbikatlar, "yasak savmak" için değil, hayat kurtarmak için yapılmalıdır.</p>
        
        <h3>Tatbikat Senaryosu Nasıl Hazırlanır?</h3>
        <ol>
            <li><strong>Risk Belirleme:</strong> Deprem mi, yangın mı, kimyasal sızıntı mı?</li>
            <li><strong>Ekip Atama:</strong> Söndürme, kurtarma, ilk yardım ekipleri.</li>
            <li><strong>Zamanlama:</strong> Haberli mi habersiz mi yapılacak?</li>
        </ol>

        <h3>Raporlama</h3>
        <p>Tatbikat sonrası mutlaka "Tatbikat Raporu" düzenlenmeli, ne kadar sürede tahliye olunduğu ve eksiklikler not edilmelidir. Fotoğraflarla belgelenmelidir.</p>
    `,
    'isg-cezalari-2026': `
        <h2>2026 Yılı İdari Para Cezaları Rehberi</h2>
        <p>Her yıl yeniden değerleme oranıyla artan cezalar, işyerleri için ciddi mali risk oluşturuyor. İşte öne çıkan cezalar:</p>

        <h3>En Sık Kesilen Cezalar</h3>
        <ul>
            <li><strong>Risk Değerlendirmesi Yapmamak:</strong> 30.000 TL'den başlar (Çalışan sayısına göre artar).</li>
            <li><strong>İSG Uzmanı/Hekim Görevlendirmemek:</strong> Her ay için ayrı ayrı uygulanır.</li>
            <li><strong>Sağlık Raporu Eksikliği:</strong> Çalışan başına uygulanır.</li>
        </ul>

        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 1rem; margin-top: 1rem;">
            <strong>Dikkat:</strong> İş kazası durumunda bu cezalar katlanarak artar ve hapis cezası riskine dönüşebilir.
        </div>
    `
}

async function main() {
    console.log('🚀 Starting GEO Evolution...')

    for (const [slug, content] of Object.entries(GEO_CONTENT)) {
        console.log(`Processing: ${slug}`)

        // Check if post exists
        const post = await prisma.blogPost.findUnique({ where: { slug } })

        if (post) {
            await prisma.blogPost.update({
                where: { slug },
                data: {
                    content: content,
                    // Add a flag or tag to mark as optimized if needed
                    tags: JSON.stringify([...(typeof post.tags === 'string' ? JSON.parse(post.tags) : []), 'GEO-Optimized'])
                }
            })
            console.log(`✅ Updated: ${slug}`)
        } else {
            console.log(`⚠️ Skipped (Not Found): ${slug}`)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
