import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

async function main() {
    console.log('Starting GEO blog post seed...')

    // 1. Ensure Category Exists
    const categorySlug = 'web-tasarim-ve-seo'
    let category = await prisma.blogCategory.findUnique({
        where: { slug: categorySlug }
    })

    if (!category) {
        console.log(`Creating category: ${categorySlug}`)
        category = await prisma.blogCategory.create({
            data: {
                name: 'Web Tasarım ve SEO',
                slug: categorySlug
            }
        })
    }

    // 2. Define Blog Post Content (GEO Optimized)
    const postData = {
        title: 'OSGB Web Sitesi Nasıl Olmalı? 2025 Standartları ve Kalite Rehberi',
        slug: 'osgb-icin-kaliteli-web-sitesi-nasil-yapilir',
        excerpt: 'Ortak Sağlık ve Güvenlik Birimleri (OSGB) için kurumsal, güven veren, yönetmeliklere uygun ve SEO dostu bir web sitesi nasıl yapılır? İşte 2025 rehberi.',
        content: `
      <h2>OSGB Sektöründe Dijital Varlığın Önemi</h2>
      <p>İş sağlığı ve güvenliği sektörü, güven ve kurumsallık üzerine kuruludur. Bir OSGB'nin web sitesi, sadece bir iletişim aracı değil, aynı zamanda firmanın yetkinliğinin dijital dünyadaki yansımasıdır. 2025 yılı itibarıyla, standart bir web sitesi artık yeterli değildir. Yapay zeka destekli arama motorları (GEO) ve gelişmiş kullanıcı beklentileri, OSGB web sitelerinin çok daha kapsamlı ve teknik olarak kusursuz olmasını gerektiriyor.</p>

      <h2>1. Yasal Zorunluluklar ve Yönetmelik Uyumu</h2>
      <p>Bir OSGB web sitesinde bulunması gereken en temel unsurlar, Çalışma ve Sosyal Güvenlik Bakanlığı yönetmeliklerine ve KVKK (Kişisel Verilerin Korunması Kanunu) standartlarına uygunluktur.</p>
      <ul>
          <li><strong>Yetki Belgesi:</strong> OSGB'nin bakanlık onaylı yetki belgesi görünür bir yerde olmalıdır.</li>
          <li><strong>Künye ve İletişim:</strong> Mersis no, KEP adresi ve açık adres bilgileri şeffaf bir şekilde paylaşılmalıdır.</li>
          <li><strong>KVKK Metinleri:</strong> Aydınlatma metni, çerez politikası ve ilgili kişi başvuru formları erişilebilir olmalıdır.</li>
      </ul>

      <h2>2. Kurumsal Güven ve Tasarım Dili</h2>
      <p>Ziyaretçilerin %75'i, bir firmanın güvenilirliğini web sitesi tasarımına bakarak yargılar. OSGB web sitesi tasarımı şu özellikleri taşımalıdır:</p>
      <ul>
          <li><strong>Temiz ve Profesyonel Arayüz:</strong> Karmaşadan uzak, kurumsal renklerin (genellikle mavi, yeşil, beyaz) kullanıldığı bir tasarım.</li>
          <li><strong>Referanslar Bölümü:</strong> Hizmet verilen firmaların logoları, sosyal kanıt (social proof) açısından kritiktir.</li>
          <li><strong>Ekip Tanıtımı:</strong> "Hakkımızda" sayfasında A, B, C sınıfı uzmanların ve işyeri hekimlerinin yetkinliklerinin sergilenmesi güveni artırır.</li>
      </ul>

      <h2>3. SEO ve Yerel Görünürlük (Local SEO)</h2>
      <p>OSGB hizmetleri genellikle lokasyon bazlıdır. Bu nedenle web siteniz "İstanbul OSGB", "Ankara İş Güvenliği" gibi aramalarda öne çıkmalıdır.</p>
      <ul>
          <li><strong>Hizmet Bölgeleri Haritası:</strong> Hangi illere hizmet verdiğinizi net bir şekilde gösterin.</li>
          <li><strong>Google Benim İşletmem Entegrasyonu:</strong> Harita yorumlarını sitenizde sergileyin.</li>
          <li><strong>Blog Stratejisi:</strong> "Yüksekte çalışma eğitimi", "Risk analizi nasıl yapılır" gibi sektörel konularda içerik üreterek organik trafik çekin.</li>
      </ul>

      <h2>4. Teknik Altyapı ve Hız</h2>
      <p>Yavaş açılan bir site, potansiyel müşteri kaybı demektir. Google'ın Core Web Vitals kriterlerine göre:</p>
      <ul>
          <li>Site açılış hızı 2.5 saniyenin altında olmalıdır.</li>
          <li>Mobil uyumluluk (Responsive Design) kusursuz olmalıdır; çünkü aramaların %60'tan fazlası mobilden yapılmaktadır.</li>
          <li>SSL Sertifikası ve güvenlik önlemleri tam olmalıdır.</li>
      </ul>

      <h2>Özet: Kaliteli Bir OSGB Sitesi İçin Kontrol Listesi</h2>
      <table border="1" style="width:100%; border-collapse: collapse; margin-top: 1rem;">
        <thead>
            <tr style="background-color: #f3f4f6;">
                <th style="padding: 10px;">Özellik</th>
                <th style="padding: 10px;">Gerekli mi?</th>
                <th style="padding: 10px;">Önemi</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="padding: 10px;">Mobil Uyumluluk</td>
                <td style="padding: 10px;">✅ Evet</td>
                <td style="padding: 10px;">Kritik</td>
            </tr>
            <tr>
                <td style="padding: 10px;">Hızlı Teklif Modülü</td>
                <td style="padding: 10px;">✅ Evet</td>
                <td style="padding: 10px;">Dönüşüm Artırıcı</td>
            </tr>
             <tr>
                <td style="padding: 10px;">WhatsApp Entegrasyonu</td>
                <td style="padding: 10px;">✅ Evet</td>
                <td style="padding: 10px;">Hızlı İletişim</td>
            </tr>
             <tr>
                <td style="padding: 10px;">Dinamik Blog</td>
                <td style="padding: 10px;">✅ Evet</td>
                <td style="padding: 10px;">SEO İçin</td>
            </tr>
        </tbody>
      </table>
      
      <p style="margin-top: 2rem;"><strong>ProSektorWeb ile Fark Yaratın:</strong> OSGB'ler için özel olarak geliştirdiğimiz hazır web sitesi paketleri ve CRM entegrasyonları ile işletmenizi dijitalde bir adım öne taşıyın.</p>
    `,
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80',
        tags: ['OSGB', 'Web Tasarım', 'SEO', 'Kurumsal Kimlik', 'Dijital Pazarlama'],
        metaTitle: 'OSGB Web Sitesi Nasıl Olmalı? 2025 Kalite ve SEO Kriterleri',
        metaDescription: 'OSGB firmaları için web sitesi yapımı rehberi. Mevzuata uygunluk, SEO stratejileri, kurumsal tasarım ve müşteri kazanımı için 2025 standartları.',
        categoryId: category.id,
        authorName: 'ProSektorWeb Editör',
        readingTime: 6,
        published: true,
        featured: true
    }

    // 3. Upsert Post
    console.log('Upserting blog post...')
    await prisma.blogPost.upsert({
        where: { slug: postData.slug },
        update: postData,
        create: postData
    })

    console.log('✅ Blog post created/updated successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    // Connection cleanup is handled by the shared instance or not needed in script for single run usually,
    // but let's be safe. Wait, if I import the shared instance, I shouldn't disconnect it if it's singleton used by app,
    // but here it is a script. Shared instance exports `prisma` which handles connection.
    // The shared file doesn't export a disconnect.
    // We can just exit the process and let OS handle it, or try to close.
    // But typically `prisma.$disconnect()` is needed to stop the event loop.
    .finally(async () => {
        // If I cannot disconnect easily because I don't have access to the underlying instance's disconnect specifically if it's wrapped?
        // Actually `prisma` imported IS the client instance (or proxy). So `prisma.$disconnect()` should work.
        await prisma.$disconnect()
    })
