/**
 * OSGB Local SEO Content Templates
 *
 * Lokasyon bazli sayfalarin icerik sablonlari
 * Her hizmet icin ozel icerik yapisI
 */

import { Province, District, getProvinceById } from "./turkey-geo-data";
import { OsgbService, getServiceById } from "./osgb-services";

// ============================================
// TEMPLATE TYPES
// ============================================

export interface ContentTemplate {
  serviceId: string;
  sections: TemplateSectionDef[];
}

export interface TemplateSectionDef {
  id: string;
  title: string;
  template: string;
  variables: string[];
  optional?: boolean;
}

export interface RenderedContent {
  html: string;
  plainText: string;
  wordCount: number;
  headings: { level: number; text: string }[];
}

// ============================================
// TEMPLATE VARIABLES
// ============================================

export interface TemplateVariables {
  // Location
  sehir: string;
  sehir_kucuk: string;
  ilce?: string;
  ilce_kucuk?: string;
  bolge: string;
  komsu_iller: string;

  // Service
  hizmet: string;
  hizmet_kucuk: string;
  hizmet_aciklama: string;

  // Company
  firma?: string;
  telefon?: string;
  email?: string;

  // Dynamic
  yil: number;
  gun: string;
}

/**
 * Template degiskenlerini hazirla
 */
export function prepareVariables(
  province: Province,
  service: OsgbService,
  district?: District,
  options?: {
    companyName?: string;
    phone?: string;
    email?: string;
  }
): TemplateVariables {
  const neighbors = province.neighbors
    .map((id) => getProvinceById(id)?.name)
    .filter(Boolean)
    .join(", ");

  const now = new Date();
  const days = ["Pazar", "Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi"];

  return {
    sehir: province.name,
    sehir_kucuk: province.name.toLowerCase(),
    ilce: district?.name,
    ilce_kucuk: district?.name?.toLowerCase(),
    bolge: district ? `${district.name}, ${province.name}` : province.name,
    komsu_iller: neighbors || "cevre iller",

    hizmet: service.name,
    hizmet_kucuk: service.name.toLowerCase(),
    hizmet_aciklama: service.shortDescription,

    firma: options?.companyName,
    telefon: options?.phone,
    email: options?.email,

    yil: now.getFullYear(),
    gun: days[now.getDay()],
  };
}

/**
 * Template'i render et
 */
export function renderTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let result = template;

  // {{degisken}} formatindaki tum degiskenleri degistir
  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined) {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, String(value));
    }
  }

  // Kullanilmayan degiskenleri temizle
  result = result.replace(/{{[^}]+}}/g, "");

  return result;
}

// ============================================
// SERVICE SPECIFIC TEMPLATES
// ============================================

/**
 * Isyeri Hekimi sayfa sablonu
 */
export const ISYERI_HEKIMI_TEMPLATE: ContentTemplate = {
  serviceId: "isyeri-hekimi",
  sections: [
    {
      id: "hero",
      title: "Hero",
      template: `
# {{bolge}} Isyeri Hekimligi Hizmeti

{{bolge}} bolgesinde profesyonel **isyeri hekimligi** hizmeti sunuyoruz.
6331 sayili Is Sagligi ve Guvenligi Kanunu kapsaminda tum yasal gereksinimleri karsiliyoruz.

[Ucretsiz Teklif Alin](#iletisim) | [Hemen Arayin](tel:{{telefon}})
      `.trim(),
      variables: ["bolge", "telefon"],
    },
    {
      id: "hizmet_tanimi",
      title: "Hizmet Tanimi",
      template: `
## {{bolge}}'da Isyeri Hekimi Ne Yapar?

Isyeri hekimi, isyerinde calisanlarin sagligini korumak ve gelistirmek amaciyla gorev yapan is sagligi uzmanidir.

### Isyeri Hekiminin Gorevleri

- **Ise Giris Muayenesi**: Yeni ise alinan calisanlarin saglik kontrolu
- **Periyodik Muayene**: Duzgun araliklarla calisan saglik takibi
- **Is Kazasi Takibi**: Kaza sonrasi saglik degerlendirmesi
- **Meslek Hastaligi Tespiti**: Ise bagli hastaliklarin onlenmesi
- **Saglik Gozetimi**: Calisanlarin genel saglik durumunun izlenmesi
- **Saglik Egitimi**: Calisanlara saglik konusunda bilgilendirme

{{sehir}} ve {{komsu_iller}} bolgesinde bu hizmetlerin tamamini sunuyoruz.
      `.trim(),
      variables: ["bolge", "sehir", "komsu_iller"],
    },
    {
      id: "yasal_zorunluluk",
      title: "Yasal Zorunluluk",
      template: `
## Isyeri Hekimi Zorunlu mu?

Evet, **6331 sayili Is Sagligi ve Guvenligi Kanunu**'na gore belirli sartlari tasiyan tum isyerleri isyeri hekimi calistirmak zorundadir.

### Tehlike Sinifina Gore Zorunluluk

| Tehlike Sinifi | Calisan Sayisi | Isyeri Hekimi Suresi |
|----------------|----------------|----------------------|
| Az Tehlikeli | 50+ calisan | Ayda en az X dakika/calisan |
| Tehlikeli | 50+ calisan | Ayda en az Y dakika/calisan |
| Cok Tehlikeli | Tum calisanlar | Ayda en az Z dakika/calisan |

### {{yil}} Yilinda Isyeri Hekimi Bulundurmama Cezasi

- **Ilk ihlal**: 5.000 - 10.000 TL idari para cezasi
- **Tekrar ihlal**: Cezalar katlanarak artar
- **Is kazasi durumunda**: Cezai sorumluluk ve tazminat

> {{sehir}}'da isletmenizin tehlike sinifini ogrenmek ve yasal yukumlulugunuzu belirlemek icin bizi arayin.
      `.trim(),
      variables: ["yil", "sehir"],
    },
    {
      id: "hizmet_kapsami",
      title: "Hizmet Bolgelerimiz",
      template: `
## {{sehir}}'da Isyeri Hekimi Hizmeti Verdigimiz Bolgeler

**{{sehir}}** merkezinden baslayarak asagidaki bolgelere isyeri hekimligi hizmeti veriyoruz:

### {{sehir}} Ilceleri
Tum {{sehir}} ilcelerine hizmet vermekteyiz. Merkez ilcelerimize ayni gun, dis ilcelere 24 saat icinde ulasim saglanmaktadir.

### Komsu Iller
- {{komsu_iller}}

Bolgesel avantajimiz sayesinde **hizli mudahale** ve **uygun fiyat** garantisi sunuyoruz.
      `.trim(),
      variables: ["sehir", "komsu_iller"],
    },
    {
      id: "fiyatlandirma",
      title: "Fiyatlandirma",
      template: `
## {{sehir}} Isyeri Hekimi Fiyatlari {{yil}}

Isyeri hekimi fiyatlari asagidaki faktorlere gore belirlenir:

- Isyerinin **tehlike sinifi**
- **Calisan sayisi**
- Isyerinin **konumu**
- Talep edilen **ek hizmetler**

### Neden Bizi Tercih Etmelisiniz?

1. **Seffaf Fiyatlandirma**: Gizli maliyet yok
2. **Esnek Odeme**: Aylik veya yillik odeme secenekleri
3. **Toplu Indirim**: Birden fazla hizmet alindiginda indirim
4. **Ucretsiz Keşif**: Fiyat teklifi icin ucretsiz isyeri ziyareti

{{bolge}} bolgesinde **ucretsiz keşif** ve fiyat teklifi almak icin bizi arayin.
      `.trim(),
      variables: ["sehir", "yil", "bolge"],
    },
    {
      id: "sss",
      title: "Sikca Sorulan Sorular",
      template: `
## {{sehir}} Isyeri Hekimi Hakkinda Sikca Sorulan Sorular

### Isyeri hekimi kac calisana gerekir?

Tehlike sinifina bagli olarak genellikle **50 ve uzeri calisan** sayisina ulasan isyerleri isyeri hekimi bulundurmak zorundadir. Ancak cok tehlikeli isyerlerinde bu sinir daha dusuktur.

### Isyeri hekimi ne siklikta gelmeli?

Tehlike sinifina ve calisan sayisina gore degisir:
- Az tehlikeli: Ayda X dakika/calisan
- Tehlikeli: Ayda Y dakika/calisan
- Cok tehlikeli: Ayda Z dakika/calisan

### {{sehir}}'da isyeri hekimi fiyati ne kadar?

Fiyatlar isyeri buyuklugu ve tehlike sinifina gore degisir. **Ucretsiz keşif** ile size ozel fiyat teklifi sunuyoruz.

### Isyeri hekimi yerine OSGB'den hizmet alabilir miyim?

Evet, kendi hekiminizi istihdam etmek yerine bizim gibi yetkili bir **OSGB**'den hizmet alabilirsiniz. Bu genellikle daha ekonomiktir.

### Isyeri hekimi olmadan is kazasi olursa ne olur?

Isyeri hekimi olmadan calisirken is kazasi meydana gelirse, isveren agir cezai ve mali sorumluluk altina girer. **SGK rucu davasi** ve **ceza davasi** riski vardir.
      `.trim(),
      variables: ["sehir"],
    },
    {
      id: "cta",
      title: "Iletisim CTA",
      template: `
## {{bolge}}'da Isyeri Hekimi Icin Hemen Bizi Arayin

{{firma}} olarak {{sehir}} ve cevresinde profesyonel isyeri hekimligi hizmeti sunuyoruz.

### Neden Beklemeyin?

- Yasal yukumluluklerinizi yerine getirin
- Is kazasi ve meslek hastaligi riskini azaltin
- Calisanlarinizin sagligini koruyun
- Olasi cezalardan kacinin

**Ucretsiz keşif ve fiyat teklifi icin:**

📞 [{{telefon}}](tel:{{telefon}})
📧 [{{email}}](mailto:{{email}})

veya asagidaki formu doldurun, **24 saat icinde** size donelim.
      `.trim(),
      variables: ["bolge", "firma", "sehir", "telefon", "email"],
    },
  ],
};

/**
 * Is Guvenligi Uzmani sayfa sablonu
 */
export const IS_GUVENLIGI_UZMANI_TEMPLATE: ContentTemplate = {
  serviceId: "is-guvenligi-uzmani",
  sections: [
    {
      id: "hero",
      title: "Hero",
      template: `
# {{bolge}} Is Guvenligi Uzmani

{{bolge}} bolgesinde **A, B ve C sinifi** is guvenligi uzmanligi hizmeti.
Isyerinizin tehlike sinifina uygun uzman destegi sunuyoruz.

[Teklif Alin](#iletisim) | [Arayin](tel:{{telefon}})
      `.trim(),
      variables: ["bolge", "telefon"],
    },
    {
      id: "uzman_siniflari",
      title: "Uzman Siniflari",
      template: `
## Is Guvenligi Uzmani Siniflari

Is guvenligi uzmanlari A, B ve C olmak uzere uc sinifa ayrilir. Hangi sinif uzman gerektigini **isyerinizin tehlike sinifi** belirler.

### A Sinifi Is Guvenligi Uzmani
- **Cok tehlikeli** isyerlerinde gorev yapar
- En yuksek yetkinlik seviyesi
- Maden, kimya, insaat gibi sektorler

### B Sinifi Is Guvenligi Uzmani
- **Tehlikeli** isyerlerinde gorev yapar
- Orta seviye yetkinlik
- Uretim, tekstil, gida gibi sektorler

### C Sinifi Is Guvenligi Uzmani
- **Az tehlikeli** isyerlerinde gorev yapar
- Temel yetkinlik seviyesi
- Ofis, perakende, hizmet sektoru

{{sehir}}'da her uc sinifta da uzman kadromuzla hizmet veriyoruz.
      `.trim(),
      variables: ["sehir"],
    },
    {
      id: "tehlike_siniflari",
      title: "Tehlike Siniflari",
      template: `
## Isyerinizin Tehlike Sinifi Nedir?

Isyerlerinin tehlike siniflari **NACE koduna** gore belirlenir.

### Az Tehlikeli Isyerleri
- Ofisler, bankalar
- Perakende magazalar
- Egitim kurumlari
- Hizmet sektoru

### Tehlikeli Isyerleri
- Uretim tesisleri
- Gida isletmeleri
- Tekstil fabrikalari
- Depolama tesisleri

### Cok Tehlikeli Isyerleri
- Maden ocaklari
- Insaat santiyeleri
- Kimya fabrikalari
- Metal isleme tesisleri

> {{sehir}}'da isyerinizin tehlike sinifini **ucretsiz** olarak belirliyoruz.
      `.trim(),
      variables: ["sehir"],
    },
    {
      id: "gorevler",
      title: "Gorev ve Yetkiler",
      template: `
## Is Guvenligi Uzmaninin Gorevleri

### Risk Degerlendirmesi
- Isyerindeki tehlikelerin tespiti
- Risk puanlama ve onceliklendirme
- Onlem onerilerinin hazirlanmasi

### Egitim ve Bilgilendirme
- Calisan ISG egitimleri
- Acil durum tatbikatlari
- Guvenlik bilgilendirmeleri

### Denetim ve Takip
- Periyodik isyeri denetimleri
- Onlemlerin takibi
- Uygunsuzluk raporlama

### Dokumantasyon
- Risk analizi raporu
- Acil durum plani
- ISG prosedurlerinin hazirlanmasi

{{bolge}} bolgesinde tum bu hizmetleri kapsamli sekilde sunuyoruz.
      `.trim(),
      variables: ["bolge"],
    },
    {
      id: "fiyatlandirma",
      title: "Fiyatlandirma",
      template: `
## {{sehir}} Is Guvenligi Uzmani Fiyatlari {{yil}}

| Tehlike Sinifi | Uzman Sinifi | Aylik Fiyat Araligi |
|----------------|--------------|---------------------|
| Az Tehlikeli | C Sinifi | Uygun |
| Tehlikeli | B Sinifi | Orta |
| Cok Tehlikeli | A Sinifi | Premium |

### Fiyati Etkileyen Faktorler

- Calisan sayisi
- Isyeri lokasyonu
- Ziyaret sikligi
- Ek hizmetler (egitim, dokumantasyon)

**{{sehir}}'da ucretsiz keşif** ile isyerinize ozel fiyat teklifi alin.
      `.trim(),
      variables: ["sehir", "yil"],
    },
    {
      id: "sss",
      title: "SSS",
      template: `
## {{sehir}} Is Guvenligi Uzmani SSS

### Hangi sinif uzman gerekir?

Isyerinizin **tehlike sinifina** gore:
- Az tehlikeli → C Sinifi
- Tehlikeli → B Sinifi
- Cok tehlikeli → A Sinifi

### Is guvenligi uzmani ne siklikta gelmeli?

Calisan sayisi ve tehlike sinifina gore aylik sure belirlenir. Genellikle:
- Az tehlikeli: Ayda 10 dk/calisan
- Tehlikeli: Ayda 15 dk/calisan
- Cok tehlikeli: Ayda 20 dk/calisan

### Uzman yerine OSGB'den hizmet alabilir miyim?

Evet, tam zamanli uzman istihdam etmek yerine OSGB'den dis kaynak hizmeti alabilirsiniz. Bu genellikle **daha ekonomik** ve **daha pratik** bir cozumdur.

### {{sehir}}'da is guvenligi uzmani nasil bulurum?

{{sehir}} bolgesinde yetkili OSGB olarak A, B ve C sinifi is guvenligi uzmanligi hizmeti veriyoruz. Hemen bizi arayin.
      `.trim(),
      variables: ["sehir"],
    },
    {
      id: "cta",
      title: "CTA",
      template: `
## {{bolge}}'da Is Guvenligi Uzmani Icin Bizi Arayin

- ✅ A, B, C sinifi uzman kadrosu
- ✅ {{sehir}} ve {{komsu_iller}} hizmet alani
- ✅ Rekabetci fiyatlar
- ✅ Hizli baslangic

📞 **{{telefon}}**
      `.trim(),
      variables: ["bolge", "sehir", "komsu_iller", "telefon"],
    },
  ],
};

/**
 * Risk Analizi sayfa sablonu
 */
export const RISK_ANALIZI_TEMPLATE: ContentTemplate = {
  serviceId: "risk-analizi",
  sections: [
    {
      id: "hero",
      title: "Hero",
      template: `
# {{bolge}} Risk Analizi ve Degerlendirmesi

{{bolge}} bolgesinde profesyonel **risk degerlendirmesi** hizmeti.
6331 sayili Kanun kapsaminda zorunlu risk analizi hazirliyoruz.

[Teklif Alin](#iletisim)
      `.trim(),
      variables: ["bolge"],
    },
    {
      id: "risk_tanimi",
      title: "Risk Analizi Nedir",
      template: `
## Risk Analizi Nedir?

Risk analizi (risk degerlendirmesi), isyerindeki tehlikelerin belirlenmesi ve bu tehlikelerden kaynaklanabilecek risklerin degerlendirilmesi surecidir.

### Risk Analizi Neden Onemli?

1. **Yasal Zorunluluk**: 6331 sayili Kanun geregi tum isyerleri risk analizi yapmak zorunda
2. **Is Kazalarini Onleme**: Tehlikeleri onceden tespit ederek kazalari onler
3. **Mali Koruma**: Is kazasi tazminatlari ve cezalardan korur
4. **Calisan Guvenligii**: Calisanlarin guvenli bir ortamda calismasini saglar

{{sehir}} bolgesinde isletmeniz icin kapsamli risk analizi hazirliyoruz.
      `.trim(),
      variables: ["sehir"],
    },
    {
      id: "metodoloji",
      title: "Metodoloji",
      template: `
## Risk Degerlendirmesi Nasil Yapilir?

### 1. Tehlike Tanimlama
- Isyeri gezisi ve gozlem
- Calisan gorusmeleri
- Makine ve ekipman incelemesi
- Kimyasal madde envanteri

### 2. Risk Belirleme
- Her tehlike icin risk puanlama
- Olasilik x Siddet matrisi
- Onceliklendirme

### 3. Onlem Planlama
- Mevcut onlemlerin degerlendirmesi
- Ek onlem onerileri
- Sorumluluk atama
- Termin belirleme

### 4. Dokumantasyon
- Risk analizi raporu
- Aksiyon plani
- Takip formlari

{{sehir}}'da uzman ekibimizle bu sureci profesyonelce yonetiyoruz.
      `.trim(),
      variables: ["sehir"],
    },
    {
      id: "sektor_bazli",
      title: "Sektor Bazli Risk Analizi",
      template: `
## Sektore Ozel Risk Analizi

Her sektorun kendine ozgu riskleri vardir. {{sehir}} bolgesinde asagidaki sektorlere ozel risk analizi yapiyoruz:

### Insaat Sektoru
- Yuksekte calisma riskleri
- Iskele guvenligi
- Elektrik carpmasi
- Malzeme dusmes

### Uretim / Fabrika
- Makine guvenligi
- Kimyasal maddeler
- Gurultu maruziyeti
- Ergonomik riskler

### Depo / Lojistik
- Forklift guvenligi
- Raf sistemleri
- Yukleme bosaltma
- Trafik duzeni

### Ofis / Hizmet
- Ergonomi
- Elektrik guvenligi
- Yangin riski
- Psikososyal riskler
      `.trim(),
      variables: ["sehir"],
    },
    {
      id: "sss",
      title: "SSS",
      template: `
## {{sehir}} Risk Analizi Sikca Sorulan Sorular

### Risk analizi zorunlu mu?

**Evet**, 6331 sayili Kanun'un 10. maddesi geregi tum isverenler risk degerlendirmesi yapmak zorundadir.

### Risk analizi kac yilda bir yenilenmeli?

- **Az tehlikeli** isyerleri: 6 yilda bir
- **Tehlikeli** isyerleri: 4 yilda bir
- **Cok tehlikeli** isyerleri: 2 yilda bir

Ayrica is kazasi, degisiklik veya yeni tehlike durumunda yenilenmeli.

### Risk analizi ucreti ne kadar?

{{sehir}}'da risk analizi ucreti isyeri buyuklugu, sektor ve tehlike sinifina gore degisir. **Ucretsiz keşif** ile size ozel fiyat veriyoruz.

### Risk analizi yapmamamin cezasi nedir?

{{yil}} yilinda risk analizi yapmayan isverenler **5.000 TL ve uzeri** idari para cezasi ile karsilasir. Is kazasi durumunda ceza katlanir.
      `.trim(),
      variables: ["sehir", "yil"],
    },
    {
      id: "cta",
      title: "CTA",
      template: `
## {{bolge}}'da Risk Analizi Yaptirin

- ✅ Uzman muhendis kadrosu
- ✅ Sektore ozel analiz
- ✅ Detayli raporlama
- ✅ Aksiyon takibi

📞 **{{telefon}}** - Ucretsiz keşif icin arayin
      `.trim(),
      variables: ["bolge", "telefon"],
    },
  ],
};

// ============================================
// TEMPLATE REGISTRY
// ============================================

export const CONTENT_TEMPLATES: Record<string, ContentTemplate> = {
  "isyeri-hekimi": ISYERI_HEKIMI_TEMPLATE,
  "is-guvenligi-uzmani": IS_GUVENLIGI_UZMANI_TEMPLATE,
  "risk-analizi": RISK_ANALIZI_TEMPLATE,
  // Diger template'ler eklenecek...
};

/**
 * Service ID'ye gore template getir
 */
export function getTemplateForService(serviceId: string): ContentTemplate | undefined {
  return CONTENT_TEMPLATES[serviceId];
}

/**
 * Sayfa icerigini render et
 */
export function renderPageContent(
  serviceId: string,
  province: Province,
  district?: District,
  options?: {
    companyName?: string;
    phone?: string;
    email?: string;
  }
): RenderedContent | null {
  const service = getServiceById(serviceId);
  const template = getTemplateForService(serviceId);

  if (!service || !template) {
    return null;
  }

  const variables = prepareVariables(province, service, district, options);

  let html = "";
  const headings: { level: number; text: string }[] = [];

  for (const section of template.sections) {
    const rendered = renderTemplate(section.template, variables);
    html += rendered + "\n\n";

    // Heading'leri cikart
    let headingMatch: RegExpExecArray | null;
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    while ((headingMatch = headingRegex.exec(rendered)) !== null) {
      headings.push({
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
    }
  }

  // Plain text versiyonu (markdown olmadan)
  const plainText = html
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[|:-]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  return {
    html,
    plainText,
    wordCount,
    headings,
  };
}
