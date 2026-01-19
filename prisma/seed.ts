import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // 1. Categories
    const categories = [
        { slug: 'is-guvenligi', name: 'İş Güvenliği' },
        { slug: 'mevzuat', name: 'Mevzuat' },
        { slug: 'saglik', name: 'Sağlık' },
        { slug: 'dijital-donusum', name: 'Dijital Dönüşüm' },
        { slug: 'risk-yonetimi', name: 'Risk Yönetimi' },
    ]

    for (const cat of categories) {
        await prisma.blogCategory.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        })
    }

    // 2. Blog Posts
    const posts = [
        {
            slug: 'is-guvenligi-uzmani-sorumluluk',
            title: 'İSG Uzmanı Günah Keçisi midir? İş Kazasında Uzmanın Sorumluluğu',
            excerpt: 'İş kazası olduğunda ilk suçlanan genellikle İSG uzmanı olur. Peki yasal olarak uzmanın sorumluluğu nedir?',
            coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
            categorySlug: 'mevzuat',
            publishedAt: new Date('2026-01-14'),
            readingTime: 7,
            authorName: 'Dr. Ahmet Yılmaz',
            tags: JSON.stringify(['İSG Uzmanı', 'Sorumluluk', 'İş Kazası', 'Yargıtay']),
            content: `
<h2>İş Kazası Olduğunda İlk Suçlanan Kimdir?</h2>
<p>Türkiye'de iş kazası meydana geldiğinde, ilk bakışta sorumlu tutulmak istenen kişi genellikle İSG uzmanı olmaktadır. Ancak 6331 sayılı İş Sağlığı ve Güvenliği Kanunu'na göre işverenin asli sorumluluğu bulunmaktadır.</p>

<h2>İSG Uzmanının Yasal Sorumlulukları</h2>
<p>İSG uzmanının sorumlulukları şunlardır:</p>
<ul>
  <li>Risk değerlendirmesi yapmak veya yaptırmak</li>
  <li>Çalışanlara eğitim vermek</li>
  <li>Denetimlerde bulunmak ve raporlamak</li>
  <li>Tehlikeli durumları yazılı olarak işverene bildirmek</li>
</ul>

<h2>Kusur Paylaşımı Nasıl Yapılır?</h2>
<p>Yargıtay kararlarına göre, İSG uzmanının kusuru ancak görevini yerine getirmemesi halinde söz konusu olmaktadır. Yazılı uyarı ve önerilerini işverene iletmiş, ancak işveren bunları uygulamamışsa, uzmanın kusuru olmayabilir.</p>

<blockquote class="bg-[#C81E1E]/5 border-l-4 border-[#C81E1E] pl-4 italic py-2 my-6 text-neutral-700">
  "İSG uzmanının kendini korumasının en önemli yolu, tüm tespit ve önerilerini onaylı deftere yazmasıdır."
</blockquote>

<h2>Onaylı Defter Neden Bu Kadar Önemli?</h2>
<p>Bu defter, mahkemede ispat aracı olarak kullanılabilmektedir. Uzman, sorumluluğunu yerine getirdiğini bu defter ile kanıtlar.</p>

<h2>Sonuç</h2>
<p>İSG uzmanları "günah keçisi" değildir. Ancak görevlerini eksiksiz yapmaları ve bunu belgeleyerek kanıtlamaları gerekmektedir. Yazılı iletişim ve kayıt tutma, hem yasal koruma hem de profesyonellik açısından kritik önem taşımaktadır.</p>
`
        },
        {
            slug: 'risk-degerlendirmesi-yontemleri',
            title: 'Risk Değerlendirmesi Yöntemleri: Fine-Kinney vs L Tipi Matris',
            excerpt: 'Hangi risk değerlendirme yöntemi sizin işyeriniz için daha uygun? Karşılaştırmalı analiz.',
            coverImage: 'https://images.unsplash.com/photo-1553877522-43269d4ea984',
            categorySlug: 'risk-yonetimi',
            publishedAt: new Date('2026-01-13'),
            readingTime: 10,
            tags: JSON.stringify(['Risk Analizi', 'Fine-Kinney', 'Matris']),
            content: '<p>Risk değerlendirmesi yöntemlerinin karşılaştırılması...</p>'
        },
        {
            slug: 'isg-yazilimi-secimi',
            title: 'OSGB İçin Doğru İSG Yazılımı Nasıl Seçilir?',
            excerpt: '2026 yılında OSGB operasyonlarınızı dijitalleştirmek için nelere dikkat etmelisiniz?',
            coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
            categorySlug: 'dijital-donusum',
            publishedAt: new Date('2026-01-12'),
            readingTime: 8,
            tags: JSON.stringify(['Yazılım', 'Dijitalleşme', 'OSGB']),
            content: '<p>Yazılım seçimi rehberi...</p>'
        },
        {
            slug: 'isyeri-hekimi-gorevleri',
            title: 'İşyeri Hekimi Sadece İlaç mı Yazar? Hayati Yetkileri',
            excerpt: 'İşyeri hekiminin yasal görev ve yetkileri, çalışanı koruma sorumluluğu.',
            coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
            categorySlug: 'saglik',
            publishedAt: new Date('2026-01-11'),
            readingTime: 6,
            authorName: 'Dr. Mehmet Öz',
            tags: JSON.stringify(['İşyeri Hekimi', 'Sağlık', 'Reçete']),
            content: '<p>Hekim görevleri...</p>'
        },
        {
            slug: 'risk-analizi-yontemleri',
            title: 'Hangi Risk Değerlendirme Yöntemi Sizin İçin Uygun?',
            excerpt: 'Fine-Kinney, Matris, L Tipi... İşyerinizin tehlike sınıfına göre en doğru risk analizi yöntemini seçin.',
            coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
            categorySlug: 'is-guvenligi',
            publishedAt: new Date('2026-01-13'),
            readingTime: 10,
            authorName: 'Müh. Ayşe Demir',
            tags: JSON.stringify(['Risk', 'Analiz', 'Metodoloji']),
            content: '<p>Detaylı analiz yöntemleri...</p>'
        },
        {
            slug: 'dijital-isg',
            title: '2026 Yılında OSGB Operasyonlarını Dijitalleştirmek',
            excerpt: 'Kağıt israfına son verin. Bulut tabanlı İSG yönetim sistemleri ile verimliliğinizi %40 artırın.',
            coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
            categorySlug: 'dijital-donusum',
            publishedAt: new Date('2026-01-12'),
            readingTime: 8,
            authorName: 'Teknoloji Ekibi',
            tags: JSON.stringify(['Bulut', 'Verimlilik', 'Kağıtsız Ofis']),
            content: '<p>Dijital dönüşüm stratejileri...</p>'
        },
        {
            slug: 'isyeri-hekimi-yetkileri',
            title: 'İşyeri Hekimi Sadece İlaç mı Yazar? Hayati Yetkileri - 2',
            excerpt: 'İşyeri hekiminin yasal görev ve yetkileri, çalışanı koruma sorumluluğu ve reçete yazma dışındaki kritik rolleri.',
            coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
            categorySlug: 'saglik',
            publishedAt: new Date('2026-01-11'),
            readingTime: 6,
            authorName: 'Dr. Mehmet Öz',
            tags: JSON.stringify(['Sağlık', 'Yetki', 'Mevzuat']),
            content: '<p>Detaylı yetki analizi...</p>'
        },
        {
            slug: 'acil-durum-tatbikati',
            title: 'İşyerinde Acil Durum Tatbikatı Düzenleme Rehberi',
            excerpt: 'Yasal zorunluluk olan acil durum tatbikatlarını etkili şekilde planlama, uygulama ve raporlama adımları.',
            coverImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
            categorySlug: 'is-guvenligi',
            publishedAt: new Date('2026-01-10'),
            readingTime: 9,
            authorName: 'İSG Uzm. Canan Dağ',
            tags: JSON.stringify(['Acil Durum', 'Tatbikat', 'Yangın']),
            content: '<p>Tatbikat senaryoları...</p>'
        },
        {
            slug: 'isg-cezalari-2026',
            title: '2026 Yılı İSG Cezaları: Kurallara Uymamanın Bedeli',
            excerpt: 'Risk analizi, eğitim eksikliği ve hekim çalıştırmama cezaları güncel rakamlarla. İşverenler için kritik uyarılar.',
            coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c',
            categorySlug: 'mevzuat',
            publishedAt: new Date('2026-01-09'),
            readingTime: 7,
            authorName: 'Hukuk departmanı',
            tags: JSON.stringify(['Cezalar', '2026', 'Yasal Uyarı']),
            content: '<p>Ceza listesi ve miktarları...</p>'
        },
    ]

    for (const post of posts) {
        // Find category ID
        const category = await prisma.blogCategory.findUnique({
            where: { slug: post.categorySlug },
        })

        if (category) {
            await prisma.blogPost.upsert({
                where: { slug: post.slug },
                update: {},
                create: {
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt,
                    content: post.content,
                    coverImage: post.coverImage,
                    categoryId: category.id,
                    publishedAt: post.publishedAt,
                    readingTime: post.readingTime,
                    authorName: post.authorName,
                    tags: post.tags,
                },
            })
        }
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
