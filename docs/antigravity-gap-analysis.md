# Antigravity Gap Analysis Report 🔍

**Date:** 2026-01-27
**Target:** ProSektorWeb Codebase
**Standard:** Vibe Coding Playbook (20 Gates)

## Executive Summary
The codebase is structurally sound in **Security** and **Database Design**, but fails critically in **Financial Logic** (Floating Point Math) and **Idempotency** (Duplicate Creation Risk).

---

## 🛑 Critical Violations (Must Fix Immediate)

### 1. Money Gate Violation (Floats in Logic)
*   **Location:** `src/features/finance/actions/invoices.ts`
*   **Evidence:**
    ```typescript
    const taxAmount = (validated.subtotal * validated.taxRate) / 100 // JS Float Math
    if (newPaid >= total - 0.1) newStatus = 'PAID' // Float Tolerance Hack
    ```
*   **Risk:** `0.1 + 0.2 !== 0.3`. You will eventually have off-by-one-cent errors in tax calculations and payments.
*   **Fix:** Migrate to `decimal.js` or Integer Math (Kuruş) in the business logic layer.

### 2. Idempotency Gate Violation (Duplicate Invoices)
*   **Location:** `createInvoice` action.
*   **Evidence:** The function generates a new `uuid` for every call. There is no check for a client-provided `idempotencyKey` or a hash of the payload.
*   **Risk:** If a user clicks "Submit" twice or there is a network retry, you will create **TWO** distinct invoices for the same job.
*   **Fix:** Add `idempotencyKey` parameter and check `redis` or `db` before processing.

---

## ⚠️ Medium Risks (Technical Debt)

### 3. Overflow Gate Warning
*   **Location:** `schema.prisma`
*   **Evidence:** `version Int @default(0)`, `viewCount Int`.
*   **Risk:** `Int` caps at 2.1 Billion. While `version` is likely safe, `viewCount` or future financial aggregations using `Int` are dangerous.
*   **Recommendation:** Prefer `BigInt` for all counters and non-relational IDs.

### 4. Git Workflows
*   **Status:** `husky` or `pre-commit` hooks were not visible in the file tree during initial scan (though script exists).
*   **Recommendation:** Verify strict `pre-push` checks are enabled.

---

## ✅ Passing Standards

*   **Security Gate:** Rate Limiting is active in `middleware.ts`.
*   **Integration Gate:** Global Soft Delete is active (`prisma.ts` patched).
*   **Database Design:** `Decimal(10,2)` is used in DB (correct storage, just wrong logic).
*   **Semantics:** `Zod` validation is present and strict.

---

## Recommended Action Plan

1.  **Refactor Invoice Logic:** Apply **Money Gate** (Decimal.js) to `invoices.ts`.
2.  **Add Idempotency:** Add `idempotencyKey` support to `createInvoice`.
3.  **Migration:** Run `prisma migrate` to sync any schema mismatches.
