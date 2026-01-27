# ProSektorWeb Project Rules (v1)

## 0) Amaç ve Kapsam
Bu doküman; ProSektorWeb projesinde **kod kalitesi, güvenlik, erişilebilirlik, performans ve release disiplinini** standardize eder. Kurallar "öneri" değil; **PR kabul kriteridir.**

---

## 1) Repo Yapısı ve Modülerlik

### 1.1 Zorunlu Dizin Konvansiyonu (Next.js App Router)

```
prosektorweb/
├── src/
│   ├── app/[locale]/           # Next.js App Router sayfaları (SSR/RSC)
│   │   ├── admin/              # Admin panel rotaları
│   │   ├── portal/             # Müşteri portalı rotaları
│   │   └── login/, forgot-password/, reset-password/  # Auth akışları
│   ├── components/
│   │   ├── ui/                 # Temel UI bileşenleri (Button, Input, Card) - Business logic YASAK
│   │   ├── admin/              # Admin'e özel bileşenler
│   │   └── auth/               # Auth akışına özel bileşenler
│   ├── features/               # İş kabiliyetleri (feature modülleri)
│   │   ├── finance/            # Fatura, ödeme işlemleri
│   │   │   ├── actions/        # Server Actions
│   │   │   └── components/     # Feature-specific UI
│   │   └── crm/                # Müşteri ilişkileri yönetimi
│   ├── actions/                # Genel Server Actions (auth, generate vb.)
│   ├── lib/                    # Ortak yardımcılar (date, format, env, crypto)
│   │   ├── auth/               # Auth helpers (crypto, root-admin, password-reset)
│   │   └── prisma.ts           # Prisma client instance
│   ├── i18n/                   # Internationalization (next-intl)
│   └── middleware.ts           # Auth + Rate limiting middleware
├── prisma/
│   └── schema.prisma           # Veritabanı şeması
├── messages/                   # Çeviri dosyaları (tr.json, en.json)
├── public/                     # Statik dosyalar
└── docs/                       # Proje dokümantasyonu
```

### 1.2 Bağımlılık Yönü (Dependency Direction)

```
components/ui  ←  components/*  ←  features/*  ←  app/[locale]/*
       ↑                ↑              ↑
      lib/            lib/          actions/
                                   services/
```

- `components/ui/` → **Sadece UI.** Business logic ve state barındırmaz.
- `components/*` → UI + minimal state (form handling vb.).
- `features/*` → UI + state + iş kuralları. **Server Actions burada olabilir.**
- `actions/` → Genel Server Actions (feature-agnostic).
- `lib/` → Saf fonksiyonlar, framework bağımsız yardımcılar.
- **Feature'lar birbirini direkt import etmez**; ortak ihtiyaçlar `lib/` veya `actions/` üzerinden çözülür.

---

## 2) Kod Standartları (Quality Gate)

### 2.1 Dil ve Stil
- **TypeScript zorunlu**; `any` yasaktır.
  - İstisna: Teknik borç kaydı + issue link ile geçici kullanım.
- **ESLint + Prettier** zorunlu. PR'de format tartışması yapılmaz.
- **No dead code**: Kullanılmayan export/komponent bırakılmaz.
- **Zod** ile tüm input/output validasyonu (Server Actions dahil).

### 2.2 Hata Yönetimi
- **UI**: Kullanıcıya anlaşılır hata mesajı + eylem (yeniden dene / destek).
- **Server Actions**: `ActionResult` / `AuthActionResult` tipi ile tutarlı dönüş.
  ```typescript
  type ActionResult = {
    success: boolean
    error?: string
    message?: string
  }
  ```
- **API/DB hataları**: Merkezi log (console.error + ileride Sentry entegrasyonu).

### 2.3 Logging
- **PII (kişisel veri) loglanmaz** – TC, şifre, email içeriği vb.
- Production'da `console.log` spam yok; sadece `console.error` veya yapılandırılmış logger.

---

## 3) Git Akışı, Commit ve PR Kuralları

### 3.1 Branch Stratejisi
- `main`: Her zaman deploy edilebilir.
- `feature/<kisa-aciklama>`: Yeni özellik.
- `fix/<kisa-aciklama>`: Bug düzeltme.
- `chore/<kisa-aciklama>`: Bakım, dependency update vb.

### 3.2 Commit Mesaj Standardı (Conventional Commits)
```
type(scope): description

Örnekler:
feat(invoice): add PDF export functionality
fix(auth): resolve session invalidation on password change
chore(deps): update prisma to 6.3.0
docs(readme): add deployment instructions
```

### 3.3 PR Kabul Kriterleri
1. **Tek amaçlı olmalı** (scope creep yok).
2. **Açıklama içermeli**: *neden* + *ne değişti* + *test kanıtı* (screenshot / test output).
3. **En az 1 onay** ve tüm CI yeşil.
4. **Typecheck + Lint** geçmeli (`npm run typecheck && npm run lint`).

---

## 4) Test Politikası

| Katman | Kapsam | Araç |
| :--- | :--- | :--- |
| **Unit** | İş kuralları (`lib/`, `features/*/actions/`) | Vitest |
| **Integration** | API istemcileri, Prisma işlemleri | Vitest + Prisma test DB |
| **E2E** | Happy path (login → ana işlem) | Playwright (ileride) |

- **Bug fix PR** = regresyon testi veya test eklenmeden merge edilmez.
- `npm run test:unit` CI'da zorunlu kapı.

---

## 5) Güvenlik Kuralları (Minimum Baseline)

### 5.1 Referans Standart
- **OWASP ASVS** web uygulaması kontrolleri için referans standarttır.

### 5.2 Oturum ve Kimlik Doğrulama (NextAuth)
- Session ID'leri **güvenilmez** kabul edilir.
- **Logout** → `sessionVersion` artırılır, mevcut oturumlar invalidate edilir.
- **Şifre değişikliği** → `sessionVersion` artırılır.
- **Inactivity timeout** → NextAuth `maxAge` ile kontrol.

### 5.3 Input Doğrulama ve XSS/Injection
- Tüm dış girdiler (form, query, header, webhook) **Zod şeması** ile doğrulanır.
- HTML/Markdown render ediliyorsa `escapeHtml` veya sanitize zorunlu.
- **SQL Injection**: Prisma ORM kullanıldığı için parametreli sorgular otomatik.

### 5.4 Secrets ve Yapılandırma
- Secrets repoya girmez (`.env` gitignore'da, `.env.example` template olarak tutulur).
- **ENCRYPTION_KEY**, **RESEND_API_KEY**, **ADMIN_PASSWORD_HASH** gibi kritik değişkenler production'da güvenli saklanır.

### 5.5 Yetkilendirme (Authorization)
- Server Actions'da **`auth()` kontrolü** zorunlu.
- Admin işlemleri için `role === 'ADMIN'` kontrolü.
- Müşteri işlemleri için `companyId` eşleşmesi.
- **Root Admin**: Env-based (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`), sessionVersion kontrolünden muaf.

---

## 6) Erişilebilirlik (A11y) – WCAG 2.2 AA Hedefi

Minimum beklentiler:
- **Klavye ile tam kullanılabilirlik** (tab order, focus görünürlüğü).
- **Dokunmatik hedef boyutu**: En az **24x24 CSS px**.
- **Form alanları**: `<Label htmlFor>` ile ilişkilendirilmeli.
- **Hata mesajları**: `role="alert"` veya `aria-live` ile duyurulmalı.

**PR'larda**: Yeni UI bileşeni = a11y kontrol listesi (label, role, aria, focus).

---

## 7) Performans – Core Web Vitals SLO'ları

| Metrik | Hedef |
| :--- | :--- |
| **LCP** (Largest Contentful Paint) | ≤ 2.5s |
| **INP** (Interaction to Next Paint) | ≤ 200ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 |

Uygulama kuralları:
- **Görsel optimizasyon**: `next/image`, lazy-load, WebP/AVIF formatları.
- **Bundle kontrolü**: Dynamic imports, route-based code splitting.
- **Layout shift önleme**: Image boyut rezervasyonu, skeleton UI, font-display: swap.

---

## 8) Tasarım Sistemi ve UI Tutarlılığı

### 8.1 Renk Paleti (CSS Variables)
```css
--brand-50 ... --brand-950  /* Ana marka renkleri (kırmızı tonları) */
--neutral-50 ... --neutral-950  /* Nötr tonlar */
```

### 8.2 Tipografi
- Font: System font stack veya Google Fonts (Inter, Outfit).
- Başlıklar: `font-serif` (sınırlı kullanım).

### 8.3 Component Standartları
- `src/components/ui/` altındaki bileşenler **tek kaynak** (Button, Input, Label, Card vb.).
- Variant'lar (`variant="primary"`, `variant="destructive"`) dokümante edilir.
- **Ad-hoc styling yasak**; token'lar kullanılır.

---

## 9) API ve Entegrasyon Kuralları

### 9.1 Server Actions (Next.js)
- Tüm mutasyonlar `'use server'` ile Server Action olarak yazılır.
- `ActionResult` tipi ile tutarlı dönüş.
- `revalidatePath` veya `revalidateTag` ile cache invalidation.

### 9.2 External Services
| Servis | Kullanım | Retry/Timeout |
| :--- | :--- | :--- |
| **Prisma (MySQL)** | Database ORM | Bağlantı havuzu |
| **Resend** | Email gönderimi | Fallback log |
| **Cloudflare** | DNS yönetimi | 10s timeout |
| **OpenAI** | İçerik üretimi | 30s timeout |

### 9.3 Error Mapping
- **Kullanıcı mesajı**: Türkçe, anlaşılır.
- **Teknik mesaj**: Log'da, kullanıcıya gösterilmez.

---

## 10) CI/CD Kapıları (Release Discipline)

### 10.1 Merge İçin Zorunlu Kapılar
```bash
npm run typecheck   # TypeScript kontrolü
npm run lint        # ESLint kontrolü
npm run build       # Production build
npm run test:unit   # Unit testler (varsa)
```

### 10.2 Deploy Akışı (`/deploy` workflow)
1. `git pull` ile sunucuya çek.
2. `npm install` bağımlılıkları güncelle.
3. `npx prisma db push` şema senkronizasyonu.
4. `npm run build` && `pm2 restart`.

### 10.3 Versiyonlama
- SemVer mantığı (MAJOR.MINOR.PATCH).
- Conventional Commits üzerinden changelog üretimi.

---

## 11) Dokümantasyon ve Operasyon

### 11.1 Zorunlu Dosyalar
| Dosya | İçerik |
| :--- | :--- |
| `README.md` | Local run, env değişkenleri, test komutları |
| `GEMINI.md` | AI/Agent için proje bağlamı |
| `.env.example` | Tüm env değişkenlerinin template'i |
| `docs/RULES.md` | Bu doküman |

### 11.2 Runbook (Prod Incident)
- **Log kontrolü**: PM2 logs veya sunucu `/var/log/`
- **Rollback**: `git checkout <tag> && npm run build && pm2 restart`
- **Acil iletişim**: [Belirlenecek]

---

## 12) İstisna Yönetimi (Governance)

Bir kuralı ihlal etmek gerekiyorsa:

1. **PR açıklamasında** `## ⚠️ İstisna` başlığı.
2. **Gerekçe** yazılmalı.
3. **Telafi planı** (ne zaman düzeltilecek).
4. **Issue kaydı** oluşturulmalı.

---

## Hızlı Referans

```bash
# Development
npm run dev

# Build & Test
npm run build
npm run typecheck
npm run lint
npm run test:unit

# Database
npx prisma db push
npx prisma studio

# Deploy (sunucuda)
git pull && npm install && npx prisma db push && npm run build && pm2 restart all
```
