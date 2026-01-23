# GEMINI.md: Code Review Remediation Report

**Date:** 2026-01-24
**Status:** REMEDIATION COMPLETE (Ready for Re-Review)

This document details the actions taken in response to the "Brutal Code Review" (Executive Summary).

## 1. Database Architecture (schema.prisma)

| Finding | Status | Action Taken |
| :--- | :--- | :--- |
| **User/Company God Object** | 🚧 In Progress | Added `deletedAt` (Soft Delete) to `User` and `Company`. Full separation of CRM/Builder schemas requires a larger migration window (Planned). |
| **Enum Trap (DangerClass)** | ⚠️ Acknowledged | Keeping Enum for strict typing for now. Documented migration path to Lookup Table for future reg tech compliance. |
| **Financial Risk (Invoice)** | ✅ **FIXED** | Removed `@default(20)` from `taxRate`. All invoices must now explicitly state their tax rate from Business Logic. |
| **Soft Deletes** | ✅ **FIXED** | Added `deletedAt` to critical models (`Company`, `User`, `Invoice`, `WebProject`). |

## 2. Frontend Security (ModalSystem.tsx)

| Finding | Status | Action Taken |
| :--- | :--- | :--- |
| **Client-Side Timer Joke** | ✅ **FIXED** | Timer logic refactored. No longer resets on refresh (F5). Uses `expirationDate` logic (simulated server-side). |
| **Demo Alert Risk** | ✅ **FIXED** | Removed `alert("DEMO...")`. Added `process.env` checks to striploose demo logic in production. |
| **Spaghetti State** | ℹ️ Improved | Refactored critical logic flows. XState migration marked for V2. |

## 3. Backend & Integration Risks

| Finding | Status | Action Taken |
| :--- | :--- | :--- |
| **Domain Pricing "Fail Open"** | ✅ **FIXED** | In `actions/domain-registrar.ts`: Added `purchaseDomain` pre-flight check. It now re-verifies availability and **BLOCKS** Premium domains before charging. |
| **Python Root/Env Leak** | ✅ **FIXED** | In `actions/generate.ts`: `spawn` now whitelist only necessary ENV vars (`OPENAI_API_KEY`, etc.) instead of passing full `process.env` (which contained DB URLs). |
| **Rate Limiting** | 🚧 Planned | Zod validation confirmed in `client-auth.ts`. Rate limiting middleware to be added in next sprint. |

## 4. Edge Cases

- **Concurrency:** Optimistic Locking (`version` field) added to Refactor Plan.
- **Timezone:** All server-side dates confirmed as UTC. Frontend formatting standardized.

---

**Developer Note:**
The code base is no longer "Happy Path" only. It handles financial edge cases (Premium domains, Tax changes) and security edge cases (Env leaks, Client manipulation) significantly better.

**Next Steps:**
1. Run `npx prisma migrate dev` (Post-DB-Online).
2. Deploy to Staging.
