# Vibe Coding 2026: Güvenli Üretim Playbook’u 🛡️

**Motto:** "Çalışıyor" ≠ "Prod'a Hazır".

Bu doküman, AI ile hızlı kod yazarken ("Vibe Coding") production güvenliği, sürdürülebilirlik ve performansı korumak için gerekli olan **Kırmızı Çizgiler** ve **Standartları** içerir.

---

## 1. Zihniyet
*   **AI Yanılgısı:** AI genelde "Happy Path" yazar; sen "Failure Mode" yazdırrmalısın.
*   **Borç:** "Sonra yazarım" = Asla yazılmaz. Teknik borç anında ödenmelidir.
*   **Döngü:** Her feature için: Ölç → Değiştir → Tekrar Ölç.

---

## 2. Mutlak Kırmızı Çizgiler 🚫

### Para / Ödeme
*   **FLOAT YASAK:** JS `Number` veya `parseFloat` asla para için kullanılmaz.
*   **Standart:** Kuruş (Integer) veya `Decimal.js` + DB `DECIMAL`.
*   **Atomic:** Para işlemleri bölünemez (Claim + Ledger + Balance = Tek Transaction).

### Secrets / .env
*   **Ignore:** `.gitignore` ilk kontrol noktasıdır.
*   **Leak:** Secret repoya girdiyse, silmek yetmez -> **Revoke & Rotate** şarttır. geçmiş temizlenmelidir.

### Webhook
*   **At-Least-Once:** Webhook birden fazla kez gelebilir.
*   **Dedupe:** `event_id` ile `INSERT IGNORE` veya Idempotency Key kullan.

---

## 3. Feature Gate Checklist (Her PR İçin) ✅

### A. Edge-Case Checklist
*   [ ] **String:** Emoji? Unicode? Invisible Char? `🚀Test`
*   [ ] **Numbers:** Negatif? Sıfır? Overflow (2038)? NaN?
*   [ ] **Arrays:** Empty `[]`? Null? Undefined?
*   [ ] **Concurrency:** Race condition? Double submit?
*   [ ] **Recursion:** Sonsuz döngü koruması (Max Depth)?

### B. Atomicity & Idempotency
*   DB işlemleri "Hep ya da Hiç" olmalı.
*   "Tekrar basarsam ne olur?" sorusu çözülmüş olmalı (Unique Key).

### C. Observability
*   Structured Logging (JSON).
*   PII (Hassas Veri) loglamak yasak.

---

## 4. Performans (MVP Standartları) ⚡
*   **Lighthouse:** Mobile ≥ 70.
*   **First Paint:** < 2s.
*   **Query:** N+1 yok (Query Count bounded).
*   **Bundle:** Gereksiz kütüphane yok (`gsap` yerine `framer-motion`).

---

## 5. Git & Workflow 🔧
*   **Şube:** Feature = Branch. Direct push yasak.
*   **Commit:** `feat(auth): ...` + `WHY`. "fix" yetersiz.
*   **Hooks:** `pre-commit` (Lint/Secret), `pre-push` (Test).
*   **Taktik:** `git diff --staged` refleksi.

---

## 6. Data Model & DB 🗄️
*   **Design:** 3NF, İlişkiler, Indexler.
*   **Types:** ID ve Sayaçlar için `BIGINT` (Overflow koruması).
*   **Soft Delete:** "Ghost Data" olmamalı. Tüm sorgularda `deletedAt` filtresi (Prisma Extension ile otomatik).
*   **Pagination:** Offset yok. Cursor-based pagination şart.

---

## 7. Güvenlik Temelleri 🔐
*   **AuthZ:** Her endpoint "Kim, Neye Erişebilir?" kontrolü yapmalı (RLS/Middleware).
*   **Validation:** Input Validation (Zod) zorunlu.
*   **Sessions:** Şifre değişince tüm oturumlar (Session/Token) patlatılmalı.
*   **Email:** `john.doe+test@gmail.com` == `johndoe@gmail.com`. Normalizasyon şart.

---

## 8. Antigravity Prompt Kütüphanesi 📚
Aşağıdaki standartlar için hazır "Gate Promptları" (`docs/prompts/`) mevcuttur:

1.  **Feature Gate:** Edge Case Checklist.
2.  **Security Gate:** Unicode Defense.
3.  **Idempotency Gate:** Double Charge Prevention.
4.  **Overflow Gate:** Data Integrity.
5.  **Semantics Gate:** Null vs Empty.
6.  **React Cleanup Gate:** Memory Safety.
7.  **Recursion Gate:** Infinite Loop Prevention.
8.  **Concurrency Gate:** Inventory Safety.
9.  **Empty-Array Gate:** Crash Prevention.
10. **Negative-Quantity Gate:** Math Exploit Prevention.
11. **Webhook Gate:** Event Duplication Safety.
12. **Cron Gate:** Job Overlap Prevention.
13. **Pagination Gate:** Feed Stability.
14. **Integration Gate:** Soft Delete Hardening.
15. **Revocation Gate:** Session Security.
16. **Email Norm Gate:** Anti-Abuse.
17. **Money Gate:** Financial Accuracy.
18. **Atomic Reward Gate:** Currency Integrity.
19. **Unicode Gate:** Emoji/Export Support.
20. **Gamification Gate:** Reward Loop Prevention.

---

**Onay:** Bu playbook, projenin anayasasıdır.
