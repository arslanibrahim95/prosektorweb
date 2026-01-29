# Changelog

Tüm önemli değişiklikler bu dosyada belgelenecektir.

Format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) baz alınmıştır.

## [Unreleased]

### Added
- Feature-based mimariye tam geçiş
- Yeni `shared/` modülü - UI Kit ve ortak utilities
- Yeni `server/` modülü - DB ve external integrations
- Comprehensive JSDoc/TSDoc dokümantasyonu
- README.md - Detaylı proje dokümantasyonu

### Changed
- `src/lib/*` -> `src/shared/lib/*` taşındı
- `src/lib/prisma.ts` -> `src/server/db/prisma.ts` taşındı
- `src/lib/ai/*` -> `src/features/ai-generation/lib/ai/*` taşındı
- Import path'leri yeni yapıya göre güncellendi

### Deprecated
- `src/lib/` dizini kullanım dışıdır
- `src/components/ui/*` kullanım dışıdır
- `src/actions/*` kullanım dışıdır

### Fixed
- AI Generation modelleri Prisma şemasına eklendi (#Refactor)
- Zod v4 uyumluluk sorunları giderildi (`z.record`, `error.issues`)
- Dashboard component'inde eksik `DateRange` export hatası düzeltildi


## [0.1.0] - 2026-01-28

### Added
- Next.js 16.1.2 ile modern React 19 altyapısı
- TypeScript 5+ desteği
- Tailwind CSS 4 ile modern UI
- Prisma ORM ile MariaDB entegrasyonu
- NextAuth.js v5 beta ile authentication
- Feature-based mimari yapı
- AI entegrasyonu (OpenAI)
- Cloudflare domain yönetimi
- Redis caching (Upstash)
- Rate limiting (Sliding Window)
- Soft delete mantığı
- Audit logging
- PDF generation (React-PDF)
- Email sending (Resend)
- Multi-tenant yapı
- i18n desteği (next-intl)
- E2E testing (Playwright)
- Unit testing (Vitest)
- Docker containerization

### Security
- CSRF protection
- Rate limiting
- Input validation (Zod)
- SQL injection protection (Prisma)
- XSS protection
- Secure session management
- PII redaction in logs

### Infrastructure
- Docker & Docker Compose
- Vercel deployment ready
- Environment-based configuration
- Structured logging (Pino)
- Error tracking (Sentry)
- Health check endpoints

---

## Mimari Karar Kayıtları (ADR)

### ADR-001: Feature-Based Architecture
**Tarih:** 2026-01-28
**Durum:** Kabul edildi

#### Karar
Projeyi feature-based mimariye taşıyacağız.

#### Gerekçe
- Kod organizasyonu ve bakım kolaylığı
- Feature'ların izole edilmesi
- Daha iyi ölçeklenebilirlik
- Takım çalışması için uygun yapı

#### Sonuçlar
- Her feature kendi actions, components, lib ve types'ını içerir
- Shared modülü ortak kaynakları barındırır
- Server modülü server-only kodları izole eder

---

### ADR-002: Soft Delete Implementation
**Tarih:** 2026-01-28
**Durum:** Kabul edildi

#### Karar
Prisma extension kullanarak otomatik soft delete uygulanacak.

#### Gerekçe
- Veri kaybını önleme
- Audit trail gereksinimi
- Geri alma imkanı

#### Sonuçlar
- `deletedAt` alanı olan modeller otomatik filtrelenir
- `delete()` ve `deleteMany()` soft delete yapar
- Raw query gerektiğinde `deletedAt: null` manuel eklenmeli

---

### ADR-003: Cache-Aside Pattern
**Tarih:** 2026-01-28
**Durum:** Kabul edildi

#### Karar
L1 Memory + L2 Redis ile çok katmanlı caching uygulanacak.

#### Gerekçe
- Performans optimizasyonu
- Redis bağımsız çalışabilirlik
- Singleflight ile duplicate request önleme

#### Sonuçlar
- `getOrSet()` fonksiyonu cache-aside mantığı uygular
- L1 cache bellekte, L2 cache Redis'te
- Redis hatası durumunda uygulama çalışmaya devam eder

---

### ADR-004: Rate Limiting Strategy
**Tarih:** 2026-01-28
**Durum:** Kabul edildi

#### Karar
Sliding Window algoritması ile Redis tabanlı rate limiting.

#### Gerekçe
- DDoS koruması
- API abuse önleme
- Fair usage garantisi

#### Sonuçlar
- Upstash Redis kullanılır
- Farklı tier'lar farklı limitler uygular
- Fail-open ve fail-closed modları destekler

---

### ADR-005: Safe Action Pattern
**Tarih:** 2026-01-28
**Durum:** Kabul edildi

#### Karar
Server actions için `createSafeAction` wrapper kullanılacak.

#### Gerekçe
- Merkezi hata yönetimi
- Otomatik logging
- Idempotency desteği
- Tip güvenliği

#### Sonuçlar
- Tüm server actions `createSafeAction` ile sarılır
- Otomatik Sentry entegrasyonu
- Standart response formatı
