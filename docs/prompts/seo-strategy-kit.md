# ProsektorWeb SEO Strateji Kiti

Bu doküman, ProsektorWeb projesi için özelleştirilmiş, yüksek etkili SEO prompt şablonlarını içerir. Bu promptları LLM (Claude, ChatGPT, Gemini) ile kullanırken köşeli parantez `[...]` içindeki alanları kendi verilerinizle doldurun.

---

## 1. Keyword Goldmine Finder (Rakipten Boşluk Çıkarma)

**Amaç:** Rakibin gözden kaçırdığı "düşük rekabet / yüksek niyet" kelimelerini bulmak.

```markdown
ProsektorWeb için SEO fırsat analizi yap.
Rakip: [competitor_url]
Pazar/Niş: [industry / niche]
Hedef ülke-dil: [TR / EN / …]
Hedef müşteri profili: [B2B/B2C, persona]
Mevcut durum: [site yaş, otorite tahmini, şu anki hedef sayfa/konu]

Rakibin içeriklerini ve URL yapılarını baz alarak, onların hedeflemediği veya zayıf hedeflediği 20 adet düşük rekabetli, yüksek niyetli (satın alma/teklif/iletişim) anahtar kelime öner.

Her kelime için şu formatta çıktı ver:
- Keyword
- Niyet: (transactional / commercial / local / informational)
- Tahmini arama hacmi aralığı: (çok düşük/düşük/orta/yüksek + sayı aralığı)
- Rekabet zorluğu tahmini: (düşük/orta) + gerekçe (SERP tipi, marka yoğunluğu, içerik kalitesi)
- Önerilen sayfa tipi: (landing page / hizmet sayfası / blog / karşılaştırma / fiyatlandırma / SSS)
- İçerik açısı: (benzersiz vaad, farklılaştırıcı)
- Hızlı kazanım notu: (neden bu kelime, nasıl hızlı sıralanır)
- ProsektorWeb için CTA önerisi: (teklif al, demo, randevu vb.)
```

---

## 2. Content Gap Destroyer (SERP Boşluğu Avı)

**Amaç:** İlk sayfadaki rakiplerden daha iyi içerik üretmek için "eksik parça" analizi.

```markdown
"[target_keyword]" için Google'da ilk sayfada yer alan ilk 5 içeriği analiz ettiğini varsay (tipik SERP rakipleri: blog, liste, landing, forum, video vb.).

Amaç: ProsektorWeb'in üreteceği içeriği daha iyi yapmak.
Şunları üret:
1. Bu 5 sayfanın ortak kalıpları (başlık yapısı, alt başlıklar, içerik uzunluğu, medya kullanımı)
2. 10 spesifik bilgi boşluğu: cevaplanmayan sorular, eksik adımlar, yanlış/yuvarlak anlatımlar
3. 10 benzersiz açı: ör. vaka örneği, süreç şeması, maliyet tablosu, 'kim için uygun/kim için değil', riskler, kontrol listeleri
4. "Superior içerik iskeleti": H1-H2-H3 önerisi + kısa notlar
5. E-E-A-T artırıcı öneriler: kanıt türleri, kaynak türleri, uzman görüşü, metodoloji

Çıktıyı tablo + kısa aksiyon listesi olarak ver.
```

---

## 3. SEO Audit Analyzer (Teknik + İçerik + Otorite)

**Amaç:** Sıralamayı engelleyen kritik hataları tespit edip önceliklendirmek.

```markdown
ProsektorWeb sitesi: [your_url]
Hedef pazar: [country]
Hedef ana kategori(ler): [services / topics]
Öncelik: [lead generation / ecommerce / brand]

Kapsamlı SEO denetimi yap ve sıralamayı baltalayan en kritik 10 sorunu çıkar.
Her sorun için:
- Sorun başlığı
- Etki seviyesi: (kritik/yüksek/orta)
- Semptomlar: (ne görürüm?)
- Olası kök neden
- Çözüm adımları (tek tek)
- Kabul kriteri: (düzeldiğini nasıl anlarım?)
- Tahmini efor: (düşük/orta/yüksek)
- Öncelik sırası (1–10)

Denetimi şu başlıklarda kapsa:
Teknik (index/crawl), Core Web Vitals, mobil, yapılandırılmış veri, kanonikal, içerik kalitesi/benzersizlik, iç link, bilgi mimarisi, backlink/otorite, yerel SEO (varsa).
```

---

## 4. Local SEO Dominator (Yerel Hizmet Stratejisi)

**Amaç:** Belirli bir bölgede (OSGB gibi) yerel aramaları domine etmek.

```markdown
İş türü: [business_type]
Şehir/ilçe: [city + district]
Hizmet alanı: [service area radius / neighborhoods]
Hedef müşteri: [persona]
Ana hedef: (arama → arama/mesaj → teklif)

Yerel SEO için içerik stratejisi tasarla:
- 15 lokasyon bazlı keyword (şehir + hizmet + niyet)
- Her keyword için: sayfa tipi + içerik fikri + başlık önerisi
- Google Business Profile optimizasyon planı:
    - Kategori/alt kategori önerisi
    - Hizmetler ve açıklama metni taslağı
    - Foto/video planı
    - SSS önerileri (en az 10)
    - Yorum toplama senaryosu (etik + sürdürülebilir)
- Yerel backlink/atıf (citation) planı: 10 kaynak türü
- 30 günlük yayın takvimi: haftalık yapılacaklar
```

---

## 5. LLM Optimization Master (AI Arama/Uyumluluk)

**Amaç:** İçeriği AI botların (ChatGPT, Gemini) kolayca anlayıp kaynak göstereceği formata getirmek.

```markdown
Konu: "[topic]"
Hedef: İçeriği LLM'lerin (ChatGPT, Gemini, Copilot vb.) doğru alıntılayabileceği şekilde yeniden yapılandır.

Girdim şu metin:
[PASTE CONTENT]

Şu kurallarla yeniden yaz:
- Net H1/H2/H3, kısa paragraflar, madde listeleri
- Tanımlar: terimleri 1 cümlede tanımla
- Doğrulanabilir, ölçülebilir ifadeler (belirsiz pazarlama dili yok)
- "Sık sorulan sorular" bölümü (en az 10)
- "Hızlı Özet" kutusu: 6–10 madde
- "Karar ağacı": Kim için uygun / değil
- Yapılandırılmış veri önerisi: (Article/FAQ/HowTo/Service vb.) alanları listele
- "Cite-worthy" bölümler: alıntılanmaya uygun 5–8 kısa gerçek cümle üret
- Kurumsal ton: profesyonel, net, iddiasını kanıtlayan

Çıktıda ayrıca:
- Meta title + meta description
- 5 adet dahili link önerisi (anchor + hedef sayfa tipi)
```

---

## 6. Internal Linking Strategist (Dahili Link Mimarisi)

**Amaç:** Otoriteyi hedef sayfaya akıtmak.

```markdown
Site: [your_url]
Hedef sayfa: [target_page_url]
Hedef keyword: [target_keyword]
Mevcut içerikler (liste veya sitemap): [PASTE URLs or sitemap]

Amaç: Hedef sayfanın otoritesini artırmak için dahili link stratejisi çıkar.

Şunları üret:
- Linklenecek en güçlü 10 kaynak sayfa (neden güçlü?)
- Her kaynak sayfa için:
    - Önerilen anchor text (2-3 varyasyon)
    - Linkin yerleştirileceği bölüm önerisi (hangi paragraf/başlık)
    - Linkleme gerekçesi (alaka/niyet akışı)
- Cluster önerisi: Pillar + 8 destek içerik başlığı
- Navigasyon önerisi: breadcrumb / kategori yapısı (varsa)
- Kaç link fazla olur? Aşırı optimizasyon risk notları
```

---

## 7. Schema Markup Generator (Rich Snippet Avcısı)

**Amaç:** Google'da zengin sonuçlar (yıldızlar, SSS, fiyat) ile görünürlüğü artırmak.

```markdown
İçerik tipi: [content_type: Service / Article / FAQ / HowTo / LocalBusiness / Product]
Konu: [topic]
Sayfa URL: [page_url]
Şirket bilgisi (varsa): [name, logo, address, phone, sameAs sosyal linkler]

Bu sayfa için en uygun schema kombinasyonunu öner ve JSON-LD üret.
Şunları yap:
- Uygun schema tür(ler)i: (primary + secondary) ve neden
- Zorunlu + önerilen alanlar (checklist)
- JSON-LD kodu (tam ve kopyalanabilir)
- Eğer LocalBusiness uygunsa: NAP tutarlılığı ve openingHours dahil et
- FAQ uygunsa: 6–10 soru/cevap ekle (kısa, net)
```

---

## 8. Competitor Content Spy (Rakip İçerik Playbook'u)

**Amaç:** Rakibin "sırrını" çözüp daha iyisini yapmak.

```markdown
Rakip: [top_competitor_domain]
Niş: [industry]
Hedef: Rakibin içerik stratejisini tersine mühendislik yapıp ProsektorWeb için daha iyi bir plan çıkarmak.

Çıktı:
- Rakibin içerik türleri (hizmet sayfası, blog, karşılaştırma, fiyat, rehber, şablon vb.)
- En muhtemel trafik mıknatısları (konu kümeleri)
- İçerik kalıpları: başlık formülleri, CTA, sayfa yapısı
- "Biz nasıl daha iyi yaparız?": 12 iyileştirme fikri (kanıt, UX, hız, örnekler, hesaplayıcı, checklist)
- ProsektorWeb için 10 içerik fikri: konu + hedef niyet + sayfa tipi
```

---

## 9. Topical Authority Mapper (Kümeli Otorite Haritası)

**Amaç:** Bir konuda "otorite" olmak için gereken tüm içerik haritasını çıkarmak.

```markdown
Ana konu: "[main_topic]"
Hedef ülke/dil: [TR/EN]
Hedef kitle: [persona]
Hedef dönüşüm: [lead / signup / call]

20–30 içerikten oluşan bir topical map tasarla:
- 1 adet pillar sayfa (H1, ana alt başlıklar, CTA)
- 6–10 adet cluster sayfa (subtopic)
- 10–15 adet long-tail destek içerik
Her içerik için:
- Başlık
- Hedef keyword + 3 yardımcı keyword
- Arama niyeti
- Önerilen içerik tipi (how-to, liste, rehber, karşılaştırma)
- İç link planı: hangi sayfaya link verir/alır
- Yayın önceliği (1–30)

Ayrıca: İçeriklerin yayın sırasını "en hızlı kazanım → en büyük otorite" mantığıyla gerekçelendir.
```

---

## 10. SEO Content Brief Creator (Editöre Teslim Edilecek Brief)

**Amaç:** Yazarın/Agent'ın tam olarak doğru içeriği üretmesini sağlamak.

```markdown
Hedef keyword: "[target_keyword]"
Sayfa tipi: [blog/service/landing]
Hedef kitle: [persona]
Mevcut sıralama: [position or 'not ranking']
Rakip örnek URL'ler: [paste 3–5 URLs]

Bir SEO içerik brifi üret:
- Kullanıcı niyeti (birincil/ikincil)
- İçerik amacı: (bilgilendir → ikna et → dönüşüm)
- Önerilen kelime sayısı aralığı + gerekçe
- Outline (H1/H2/H3)
- Zorunlu bölümler: (SSS, örnek, checklist, fiyat/alternatifler vb.)
- Dahil edilecek terimler: 20 related keyword / entity
- E-E-A-T gereklilikleri: kanıt türleri ve kaynak türleri
- On-page SEO checklist: title, meta, slug, görsel alt, internal link, schema
- CTA önerileri (2–3 varyasyon)
- "Başarılı sayfa kriterleri": ölçülebilir hedefler (CTR, dwell time, lead)
```

---

## 💡 Pro Tip (Her Prompt İçin)

ProsektorWeb bağlamında en iyi sonucu almak için promptlara şu detayları eklemeyi unutmayın:

*   **Hedef sayfa türü:** (hizmet/landing/blog/kategori)
*   **Dönüşüm olayı:** (form, arama, WhatsApp, demo)
*   **Coğrafya & dil:** (TR geneli mi, şehir mi?)
*   **Rakip seviyesi:** (küçük yerel / ulusal marka / marketplace)
