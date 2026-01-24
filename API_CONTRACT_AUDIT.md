# API Contract Audit & Remediation Plan

**Date:** 2026-01-24
**Auditor:** Senior API Architect
**Scope:** `prosektorweb` (Server Actions & API Routes)
**Status:** 🚨 CRITICAL FRAGILITY DETECTED

## 1. Executive Summary: The "Split Personality" Crisis

The application suffers from a **Contract Identity Crisis**. While `lib/safe-action.ts` defines a robust wrapper with logging/Sentry, **it is completely unused**.
Instead, every Server Action implements ad-hoc `try/catch` blocks, resulting in:
1.  **Inconsistent Return Types:** `Invoice` returns `{ success: boolean }`, while the unused standard proposed `{ data, error }`.
2.  **Missing Safety Nets:** Rate limiting is manual and often forgotten (`invoice.ts`).
3.  **Zero Idempotency:** Critical financial actions (`createInvoice`, `purchaseDomain`) have no protection against double-submission/network replays.

**Risk Level:** HIGH. Double-billing and easy DoS vectors exist.

## 2. Contract Inventory & Health Check

| Endpoint / Action | Type | Auth | Rate Limit | Idempotency | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `actions/invoice.ts` (create) | Server Action | ✅ Yes | ❌ **NONE** | ❌ **NONE** | 🚨 **P0** (Financial Risk) |
| `actions/domain.ts` (purchase) | Server Action | ✅ Admin | ✅ Yes (Redis) | ❌ **NONE** | 🚨 **P0** (Double Purchase Risk) |
| `api/contact/route.ts` | API Route | ❌ Public | ⚠️ Ad-hoc (DB) | N/A | ⚠️ **P1** (Performance Risk) |
| `lib/safe-action.ts` | Infrastructure | N/A | N/A | N/A | 👻 **GHOST CODE** (Unused) |

## 3. Critical Findings (P0/P1)

### [API-001] P0 - Missing Idempotency in Financial Transactions
- **Problem:** `createInvoice` and `purchaseDomain` accept requests without a unique `idempotencyKey`.
- **Scenario:** User clicks "Create Invoice" (tax logic involved) -> Network hangs -> User clicks again.
- **Result:** Two invoices created. The logic checks `invoiceNo` collision but `generateInvoiceNo` makes a *new* number for the second request.
- **Fix:** Accept `idempotencyKey` (UUID) from client. Store result in Redis/DB with TTL. Return cached response on replay.

### [API-002] P0 - Inconsistent Rate Limiting
- **Problem:** `invoice.ts` has NO rate limit. `contact/route.ts` hits the DB to count requests (slow). `domain-registrar.ts` uses Redis correctly.
- **Impact:** An attacker can spam `createInvoice` to fill the DB or trigger tax calculation overhead.
- **Fix:** Standardize on `lib/rate-limit.ts` (Redis) for ALL write operations.

### [API-003] P1 - Ghost Infrastructure (`createSafeAction`)
- **Problem:** A robust error handling/logging wrapper exists but is ignored.
- **Impact:** Every action re-invents logging and error masking. Sentry integration is spotty.
- **Fix:** Refactor `createSafeAction` to match the prevalent `ActionResponse` format (`success: boolean`) and enforce its usage.

### [API-004] P2 - Poor Error Semantics
- **Problem:** Errors are just strings (`error: "Something went wrong"`).
- **Impact:** Frontend cannot distinguish between `UserError` (show toast) vs `SystemError` (show error page) vs `RateLimit` (show timer).
- **Fix:** Introduce `AppError` with codes: `code: "RATE_LIMIT_EXCEEDED"`, `code: "INSUFFICIENT_FUNDS"`.

## 4. Remediation Plan (Master To-Do)

### Phase 1: Stop the Bleeding (P0)
- [ ] **Refactor `createSafeAction`**: Update it to return `Promise<ActionResponse<T>>`.
  - Must return `{ success: true, data: T }` or `{ success: false, error: string, code: string }`.
  - Must automatically handle `Sentry` capture.
- [ ] **Apply to `invoice.ts`**: Wrap `createInvoice` with `createSafeAction`.
- [ ] **Apply to `domain-registrar.ts`**: Wrap `purchaseDomain`.

### Phase 2: Idempotency & Rate Limit (P1)
- [ ] **Enhance `createSafeAction`**: Add middleware support.
  - `.use(rateLimit({ limit: 10 }))`
  - `.use(idempotency({ ttl: 60 }))`
- [ ] **Update Frontend**: Pass `idempotencyKey` header/arg in mutation hooks.

### Phase 3: API Route Standardization
- [ ] Create `createApiHandler` wrapper for REST routes (Next.js App Router).
- [ ] Replace `contact/route.ts` ad-hoc DB rate limit with Redis limit.

## 5. Golden Contract Standards (For Future)

**Response Envelope:**
```typescript
type ActionResponse<T> =
  | { success: true; data: T; meta?: { requestId: string } }
  | { success: false; error: string; code: string; meta?: { requestId: string } }
```

**Error Codes:**
- `VALIDATION_ERROR` (Form fields)
- `RATE_LIMIT` (Back off)
- `IDEMPOTENCY_CONFLICT` (Already processed)
- `INTERNAL_ERROR` (Generic)

**Verification:**
Run `grep -r "createSafeAction" src/actions` -> Must return matches for all files.
