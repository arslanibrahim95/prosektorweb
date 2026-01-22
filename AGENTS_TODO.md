# ProSektorWeb Geliştirme ve İyileştirme Planı

Bu belge, ProSektorWeb projesini devralacak olan yazılım geliştirme asistanı (Agent) için hazırlanmış teknik bir yol haritasıdır. Projenin mevcut durumu (canlı/geliştirme hibrit) göz önüne alınarak, veri bütünlüğünü bozmadan güvenliği ve kaliteyi artıracak maddeler önceliklendirilmiştir.

## 🚨 1. Kritik Güvenlik İyileştirmeleri (ÖNCELİKLİ)

Mevcut `src/actions` yapısında Server Action'lar `use server` direktifi ile korunsa da, fonksiyon bazlı yetki kontrolü (Authorization) eksiktir. Bu durum, yetkisiz kullanıcıların API endpoint'lerini tahmin ederek işlem yapabilmesine olanak tanır.

- [ ] **Server Action Yetkilendirmesi (Middleware Yetersiz Kalabilir):**
  - Tüm `src/actions/*.ts` dosyalarındaki mutasyon (create, update, delete) fonksiyonlarının başına `auth()` kontrolü ekleyin.
  - **Örnek Uygulama:**
    ```typescript
    import { auth } from '@/auth'

    export async function deleteCompany(id: string) {
      const session = await auth();
      if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized: Yetersiz yetki.');
      }
      // ... işlem devamı
    }
    ```
  - `src/actions/company.ts` dosyasını pilot bölge olarak kullanıp refactor edin.

- [ ] **Zod Şemaları ile Backend Validasyonu:**
  - `zod` kullanımı mevcut ancak tüm action'larda tutarlı değil. Her form işlemi için `schema.parse` veya `safeParse` kullanıldığından emin olun.

## 🚀 2. Performans ve Veri Yönetimi

Bazı listeleme sayfalarında (örneğin `Proposals`), verilerin tamamı veritabanından çekilip (`findAll`) client tarafında filtrelenmektedir. Veri sayısı arttığında bu yapı performansı ciddi şekilde düşürecektir.

- [ ] **Database-Level Filtering & Pagination:**
  - `prisma.findMany` sorgularını dinamik hale getirin.
  - `getProposals` ve benzeri "getAll" fonksiyonlarını, `search`, `page`, `limit`, `status` gibi parametreler alacak şekilde güncelleyin.
  - **Hedef:** `src/app/admin/proposals/page.tsx` içindeki client-side filtreleme mantığını backend'e taşıyın.

- [ ] **N+1 Sorgu Optimizasyonu:**
  - Prisma sorgularında ilişkili verileri çekerken (`include`), gereksiz derinlikten kaçının veya sadece gerekli alanları (`select`) çekin.

## 🛠 3. Kod Kalitesi ve Refactoring

- [ ] **TypeScript 'any' Temizliği:**
  - `src/actions` klasöründeki `error: any` kullanımlarını `unknown` ile değiştirin ve Type Guard kullanarak hatayı işleyin.
  - **Örnek:**
    ```typescript
    try { ... } catch (error: unknown) {
      if (error instanceof Error) return { success: false, message: error.message };
    }
    ```

- [ ] **Ortak Hata Yönetimi (Error Handling):**
  - Server Action dönüş tiplerini standartlaştırın (Örn: `ActionResponse<T>`).
  - `{ success: boolean, data?: T, error?: string }` yapısını tüm projeye yayın.

- [ ] **Modüler Klasör Yapısı (Öneri):**
  - `src/components/admin` altındaki bileşenleri, ilgili domain'e göre (örn: `components/admin/company/CompanyForm.tsx`) gruplandırmayı değerlendirin.

## 🧪 4. Test Altyapısı (SIFIRDAN KURULUM)

Projede şu an test altyapısı bulunmamaktadır. Canlıya alınan bir projede regresyon hatalarını önlemek için testler kritiktir.

- [ ] **Test Ortamının Kurulması:**
  - `vitest` (Hızlı unit testler için) ve `@testing-library/react` kurulumunu yapın.
  - `src/__tests__` klasör yapısını oluşturun.

- [ ] **Kritik Fonksiyon Testleri:**
  - `src/lib/utils.ts` (varsa) içindeki yardımcı fonksiyonlar için unit testler yazın.
  - `src/actions` altındaki iş mantığı için mock veritabanı (vitest-mock-extended + prisma) ile testler yazın.

## ⚙️ 5. DevOps ve CI/CD Hazırlığı

- [ ] **Linting & Formatting:**
  - `eslint` kurallarını `unused-vars` gibi hataları yakalayacak şekilde sıkılaştırın.
  - Prettier entegrasyonunu doğrulayın.

- [ ] **Pre-commit Hooks:**
  - `husky` ve `lint-staged` kurarak her commit öncesi `tsc --noEmit` ve `lint` çalışmasını sağlayın. Bu, bozuk kodun repoya girmesini engeller.

## 📝 6. Eksik / Yarım Kalan Özellikler

Kod incelemesi sırasında tespit edilen eksiklikler:

- **Fatura (Invoice) Modülü:** Şemada `Invoice` ve `Payment` modelleri var ancak arayüz entegrasyonunun tam olup olmadığı (kısmi ödeme, pdf oluşturma vb.) kontrol edilmeli.
- **Raporlama:** `src/app/admin/reports` klasörü mevcutsa da içi boş veya statik olabilir. Dinamik dashboard verileri için API/Action yazılması gerekebilir.

---
**Önerilen Çalışma Sırası:**
1. Güvenlik (Server Action Auth)
2. Test Altyapısı Kurulumu
3. Performans (Pagination/Filtering)
4. Refactoring & Cleanup
