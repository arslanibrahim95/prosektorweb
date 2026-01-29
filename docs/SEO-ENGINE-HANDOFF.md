# OSGB Local SEO Engine - Developer Handoff

## Genel Bakis

81 il, ~970 ilce, 11 OSGB hizmeti icin lokasyon bazli SEO sayfa uretim motoru.
Her OSGB kendi ili + sinir komsu illeri icin sayfa uretir. Toplam ~72.000 sayfa kapasitesi.

---

## Mimari

```
src/features/ai-generation/lib/pipeline/seo/
├── index.ts                 # Barrel exports
├── turkey-geo-data.ts       # 81 il, ilceler, komsuluk, sanayi profili
├── osgb-services.ts         # 11 OSGB hizmeti ve keyword tanimlari
├── content-templates.ts     # Hizmet bazli icerik sablonlari
└── local-seo-generator.ts   # Sayfa uretici, schema.org, sitemap

src/components/seo/
├── LocalSeoPage.tsx         # Sayfa renderlarken kullanilan React component
└── JsonLd.tsx               # Schema.org JSON-LD component

src/app/[locale]/
├── [cityService]/
│   ├── page.tsx             # Il seviyesi sayfa  (/istanbul-isyeri-hekimi/)
│   └── [district]/
│       └── page.tsx         # Ilce seviyesi sayfa (/istanbul-isyeri-hekimi/kadikoy/)
```

---

## URL Yapisi

```
/{il-slug}-{hizmet-slug}/              -> Il sayfasi
/{il-slug}-{hizmet-slug}/{ilce-slug}/  -> Ilce sayfasi
```

Ornekler:
- `/istanbul-isyeri-hekimi/`
- `/istanbul-isyeri-hekimi/kadikoy/`
- `/bolu-risk-analizi/`
- `/bolu-risk-analizi/mudurnu/`
- `/sakarya-is-guvenligi-uzmani/sapanca/`

---

## Hizmet Alani Mantigi

Bir OSGB **kendi ili + kara siniri komsu illere** hizmet verebilir.

```typescript
import { getServiceAreaProvinces } from "@/features/ai-generation/lib/pipeline/seo";

// Bolu (14) icin hizmet alani
const area = getServiceAreaProvinces(14);
// Sonuc: [Bolu, Ankara, Bilecik, Cankiri, Sakarya, Zonguldak, Karabuk, Duzce]
```

Her il icin uretilecek sayfalar:
- Kendi ili: il sayfasi + tum ilce sayfalari
- Her komsu il: il sayfasi + tum ilce sayfalari
- Her sayfa x 11 hizmet

Ornek - Bolu OSGB:
- 8 il x 11 hizmet = 88 il sayfasi
- 92 ilce x 11 hizmet = 1012 ilce sayfasi
- **Toplam: 1100 sayfa**

---

## 11 OSGB Hizmeti

| # | ID | Baslik | Slug |
|---|---|---|---|
| 1 | isyeri-hekimi | Isyeri Hekimligi | isyeri-hekimi |
| 2 | is-guvenligi-uzmani | Is Guvenligi Uzmanligi | is-guvenligi-uzmani |
| 3 | risk-analizi | Risk Degerlendirmesi | risk-analizi |
| 4 | isg-egitimi | ISG Egitimi | is-guvenligi-egitimi |
| 5 | ilkyardim-egitimi | Ilkyardim Egitimi | ilkyardim-egitimi |
| 6 | yangin-egitimi | Yangin Egitimi | yangin-egitimi |
| 7 | saglik-taramasi | Saglik Taramasi | saglik-taramasi |
| 8 | acil-durum-plani | Acil Durum Plani | acil-durum-plani |
| 9 | isg-kurulu | ISG Kurulu | isg-kurulu |
| 10 | onayli-defter | Onayli Defter | onayli-defter |
| 11 | isg-katip | ISG-KATIP | isg-katip |

---

## Sayfa Uretim Pipeline

### 1. Tek Sayfa Uretimi

```typescript
import {
  generateLocalPage,
  getProvinceById,
  getServiceById,
} from "@/features/ai-generation/lib/pipeline/seo";

const province = getProvinceById(14); // Bolu
const service = getServiceById("isyeri-hekimi");
const district = province.districts.find(d => d.slug === "mudurnu");

const page = generateLocalPage(service, province, district, {
  companyName: "Bolu OSGB",
  baseUrl: "https://bolu-osgb.com",
});

// page icerigi:
// - page.title           -> "Mudurnu, Bolu Isyeri Hekimligi"
// - page.metaDescription -> SEO meta description
// - page.keywords         -> ["mudurnu isyeri hekimi", ...]
// - page.h1              -> "Mudurnu Isyeri Hekimligi"
// - page.sections[]      -> [hero, hizmet_tanimi, yasal_zorunluluk, hizmet_kapsami, sss, iletisim_cta]
// - page.schema          -> Schema.org LocalBusiness JSON-LD
// - page.neighborLinks[] -> [{name: "Duzce", url: "/duzce-isyeri-hekimi/", districtCount: 8}]
// - page.relatedPages[]  -> Komsu il + diger hizmet linkleri
// - page.breadcrumbs[]   -> [Ana Sayfa > Isyeri Hekimligi > Bolu > Mudurnu]
```

### 2. Toplu Sayfa Uretimi (Bir OSGB Icin)

```typescript
import {
  generateAllLocalPages,
  generateSiteStructure,
} from "@/features/ai-generation/lib/pipeline/seo";

// Bolu OSGB icin tum sayfalar
const pages = generateAllLocalPages(14, {
  companyName: "Bolu OSGB",
  baseUrl: "https://bolu-osgb.com",
  includeDistricts: true,
});
// -> ~1100 LocalPage objesi

// Veya site yapisi + sitemap dahil
const site = generateSiteStructure(14, "bolu-osgb.com", {
  companyName: "Bolu OSGB",
  includeDistricts: true,
});
// site.totalPages, site.pages, site.sitemap
```

### 3. Sitemap Uretimi

```typescript
import {
  generateSiteStructure,
  generateSitemapXml,
  generateSitemapIndex,
} from "@/features/ai-generation/lib/pipeline/seo";

const site = generateSiteStructure(14, "bolu-osgb.com");

// Tek sitemap (< 1000 URL)
const xml = generateSitemapXml(site.sitemap);

// Buyuk siteler icin bolunmus sitemap
const { index, sitemaps } = generateSitemapIndex(
  site.sitemap,
  "https://bolu-osgb.com",
  1000 // her dosyada max 1000 URL
);
// index -> sitemap index XML
// sitemaps -> [{filename: "sitemap-1.xml", xml: "..."}, ...]
```

---

## Sayfa Icerigi Yapisi

Her `LocalPage` su section'lardan olusur:

| Section ID | Type | Aciklama |
|---|---|---|
| `hero` | hero | Baslik, aciklama, CTA butonlari |
| `hizmet_tanimi` | text | Hizmet aciklamasi + sektor deneyimi |
| `yasal_zorunluluk` | text | 6331 kanun referansi, zorunluluklar |
| `hizmet_kapsami` | text | Komsu illerin listesi (linkli) |
| `sss` | faq | 7-9 SSS (hizmet + komsuluk sorulari) |
| `iletisim_cta` | cta | Telefon + form CTA |

### Icerik Sablonlari (Content Templates)

Her hizmet icin ayri icerik sablonu var. Degiskenler otomatik doldurulur:

```typescript
import {
  renderPageContent,
  prepareVariables,
} from "@/features/ai-generation/lib/pipeline/seo";

// Sablon degiskenleri:
// {{sehir}}              -> "Bolu"
// {{ilce}}               -> "Mudurnu"
// {{bolge}}              -> "Mudurnu, Bolu"
// {{komsu_iller}}        -> "Ankara, Bilecik, Cankiri, Sakarya, Zonguldak, Karabuk, Duzce"
// {{hizmet}}             -> "Isyeri Hekimligi"
// {{bolge_sektorler}}    -> "Gida Sanayi, Insaat Sektoru"
// {{bolge_riskler}}      -> "biyolojik tehlikeler, yuksekten dusme, elektrik carpmasi"
// {{yil}}                -> 2026

const content = renderPageContent("isyeri-hekimi", province, district, {
  companyName: "Bolu OSGB",
});
// content.html       -> Render edilmis HTML
// content.plainText  -> Duz metin
// content.wordCount  -> Kelime sayisi
// content.headings   -> [{level: 2, text: "..."}, ...]
```

---

## React Component Kullanimi

```tsx
import { LocalSeoPage } from "@/components/seo/LocalSeoPage";

// LocalSeoPage su componentleri icerir:
// - BreadcrumbNav     -> Schema.org BreadcrumbList ile
// - HeroSection       -> Gradient arka plan, CTA butonlari
// - TextSection       -> Markdown -> HTML donusumu (linkler dahil)
// - FaqSection        -> <details> accordion + FAQPage schema
// - CtaSection        -> Telefon + form CTA
// - NeighborGrid      -> Komsu illerin kart gorunumu (MapPin ikon, ilce sayisi)
// - RelatedLinks      -> Diger hizmet/bolge linkleri

<LocalSeoPage page={page} />
```

---

## Komsuluk API

```typescript
import {
  areNeighbors,
  getCommonNeighbors,
  getNeighborProvinces,
  getServiceAreaProvinces,
  findShortestPath,
  getProvincesWithinDistance,
  validateNeighborConsistency,
} from "@/features/ai-generation/lib/pipeline/seo";

areNeighbors(34, 41);              // true  (Istanbul-Kocaeli)
areNeighbors(34, 6);               // false (Istanbul-Ankara)

getCommonNeighbors(34, 16);        // [Kocaeli] (Istanbul-Bursa ortak komsu)

findShortestPath(22, 34);          // [Edirne, Tekirdag, Istanbul]

getProvincesWithinDistance(6, 1);   // Ankara'nin 7 komsusu
getProvincesWithinDistance(6, 2);   // Ankara'dan 2 adim uzaktaki ~28 il

validateNeighborConsistency();      // [] (bos = tutarli)
```

---

## Sanayi Profili

Her ilin sanayi sektorleri tanimli. Sayfa iceriginde otomatik kullanilir:

```typescript
import {
  getProvinceSectors,
  getProvinceSectorNames,
  getProvinceSectorRisks,
  getProvinceDominantDangerClass,
} from "@/features/ai-generation/lib/pipeline/seo/turkey-geo-data";

getProvinceSectorNames(41);           // ["Otomotiv Sanayi", "Kimya Sanayi", "Metal Sanayi"]
getProvinceSectorRisks(41);           // ["makine sikisma", "kimyasal maruziyet", ...]
getProvinceDominantDangerClass(41);   // "cok_tehlikeli"
```

Icerik etkisi:
- Hero section'da sektor vurgusu
- Meta description'da sektor keyword'leri
- SSS'de sektor-ozel sorular
- Schema.org `knowsAbout` alaninda sektor bilgisi

---

## Entegrasyon Gorevleri

### Gorev 1: Dinamik Route Dogrulamasi

Mevcut `[cityService]` route'u static export icin ayarli. Production'da ISR (Incremental Static Regeneration) veya on-demand generation tercih edilebilir.

**Dosyalar:**
- `src/app/[locale]/[cityService]/page.tsx`
- `src/app/[locale]/[cityService]/[district]/page.tsx`

**Dikkat:** `RESERVED_SEGMENTS` listesi guncel tutulmali. Yeni bir top-level route eklenirse buraya da eklenmeli:
```typescript
const RESERVED_SEGMENTS = new Set([
  "admin", "blog", "portal", "login", "forgot-password",
  "reset-password", "proposal", "cerez-politikasi",
  "gizlilik-ve-kvkk", "mesafeli-satis-sozlesmesi", "demo",
]);
```

### Gorev 2: generateStaticParams Optimizasyonu

`generateStaticParams` su anda 81 il x 11 hizmet = **891 il sayfasi** + ~970 ilce x 11 = **~10.670 ilce sayfasi** uretiyor. Bu build suresini uzatir.

Onerilen yaklasim:
```typescript
// Sadece yuksek oncelikli illeri static uret
export async function generateStaticParams() {
  const priorityProvinces = getIndustrialProvinces(); // Top 10
  // ... geri kalani ISR ile on-demand
}
```

Veya `next.config.ts`'de:
```typescript
export default {
  experimental: {
    // ISR ile on-demand generation
    dynamicParams: true,
  },
};
```

### Gorev 3: Sitemap Entegrasyonu

`src/app/sitemap.ts` guncellendi ama ~72.000 URL tek sitemap'e sigmaz. Production icin sitemap splitting gerekli:

```typescript
// src/app/sitemap.ts yerine
// src/app/sitemap/[id]/route.ts kullanarak bolunmus sitemap

import { generateSitemapIndex } from "@/features/ai-generation/lib/pipeline/seo";
```

Next.js `sitemap()` fonksiyonu 50.000 URL limitine sahip. Asarsa `generateSitemapIndex()` ile bolunmus sitemap dosyalari uretilmeli.

### Gorev 4: Firma Bilgisi Entegrasyonu

Su anda `companyName`, `phone`, `email` opsiyonel. Production'da her musteri OSGB'nin bilgileri DB'den cekilmeli:

```typescript
// Ornek: Portal'daki firma bilgisini al
const company = await prisma.company.findUnique({ where: { id: companyId } });

const page = generateLocalPage(service, province, district, {
  companyName: company.name,
  baseUrl: `https://${company.domain}`,
  phone: company.phone,
  email: company.email,
});
```

### Gorev 5: Caching / Performance

72.000 sayfa icin oneriler:
- **Redis cache**: Uretilen sayfalari cache'le, TTL 24 saat
- **Edge caching**: Cloudflare/Vercel edge'de cache
- **Lazy generation**: Ilk istekte uret, sonra cache'ten sun
- **Prerender**: Oncelikli 10 il (Istanbul, Ankara, Izmir, Bursa, Kocaeli, Antalya, Adana, Konya, Gaziantep, Mersin) build'de static uret

### Gorev 6: CTA Telefon/Form Baglantisi

`LocalSeoPage.tsx`'de CTA butonlari simdilik hardcoded:
```tsx
<a href="tel:+905551234567">
```

Bu deger firma bazli dinamik olmali. Onerilen yaklasim:
- `LocalSeoPage`'e `phone` ve `formUrl` prop'u ekle
- Veya `page.schema.telephone` degerini kullan

### Gorev 7: Analytics Entegrasyonu

Her local SEO sayfasinda tracking:
- Sayfa goruntulenme (il/ilce/hizmet bazli)
- CTA tiklanma (telefon/form)
- Hangi komsuluk linkleri tiklanmis

---

## Test Komutlari

```bash
# TypeScript kontrol
npx tsc --noEmit

# Komsuluk tutarliligi dogrulama
npx tsx -e "
const { validateNeighborConsistency } = require('./src/features/ai-generation/lib/pipeline/seo/turkey-geo-data');
const issues = validateNeighborConsistency();
console.log('Tutarsizlik:', issues.length);
"

# Belirli bir il icin sayfa uretimi test
npx tsx -e "
const { generateLocalPage, getProvinceById, getServiceById } = require('./src/features/ai-generation/lib/pipeline/seo');
const p = getProvinceById(14);
const s = getServiceById('isyeri-hekimi');
const page = generateLocalPage(s, p);
console.log(page.title);
console.log(page.neighborLinks.map(n => n.name));
console.log('Sections:', page.sections.map(s => s.id));
"

# Toplam istatistikler
npx tsx -e "
const { getAllProvinces, getAllServices, getServiceAreaProvinces } = require('./src/features/ai-generation/lib/pipeline/seo');
const provinces = getAllProvinces();
const services = getAllServices();
let total = 0;
provinces.forEach(p => {
  const area = getServiceAreaProvinces(p.id);
  const d = area.reduce((s, a) => s + a.districts.length, 0);
  total += (area.length + d) * services.length;
});
console.log('Toplam potansiyel sayfa:', total);
"
```

---

## Onemli Notlar

1. **Slug kurali**: Turkce karakter yok. s->s, c->c, g->g, i->i, o->o, u->u
2. **Komsuluk**: Sadece kara siniri. Deniz komsulugu sayilmaz (Istanbul-Bursa deniz komsusu, kara komsusu degil)
3. **Route conflict**: `[cityService]` dynamic segment tum top-level route'lari yakalar. `RESERVED_SEGMENTS` guncel tutulmali
4. **Sitemap limiti**: Next.js sitemap 50.000 URL limit. Splitting gerekli
5. **Build suresi**: 72.000 sayfa full static build icin saatler surebilir. ISR onerilir
6. **Komsuluk validasyonu**: `validateNeighborConsistency()` deploy oncesi CI'da calistirilmali. Bos array donmeli
