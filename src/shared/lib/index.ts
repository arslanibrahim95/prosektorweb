/**
 * @file src/shared/lib/index.ts
 * @description Shared library exports - Public API for shared utilities
 */

// Core utilities
export { cn, slugify } from './utils';
export { logger } from './logger';

// Money & Tax
export { toDecimal, formatMoney, calculateTaxPrecise } from './money';
export { TAX_HISTORY, getTaxRate, calculateTax } from './tax';

// Action types & helpers
export type { ActionResponse, PaginatedResponse } from './action-types';
export {
    getErrorMessage,
    getZodErrorMessage,
    isPrismaUniqueConstraintError,
    validatePagination,
    PAGINATION
} from './action-types';

// Resiliency patterns
export type { Result, AppError, RetryOptions } from './resiliency';
export { executeWithRetry } from './resiliency';

// Cache & Redis
export { redis, acquireLock, releaseLock } from './redis';
export { getOrSet, invalidateCache } from './cache';

// Rate Limiting - Note: checkRateLimit uses next/headers internally, server-only
// Do NOT export from index to avoid client-side import issues
// Import directly from '@/shared/lib/rate-limit' in server components
// export { checkRateLimit, RATE_LIMIT_TIERS } from './rate-limit';
// export type { RateLimitOptions } from './rate-limit';

// Headers - Server-side header utilities (server-only)
// Import directly from '@/shared/lib/headers' for server components only
// export * from './headers';

// CSRF Protection - Server-only, import directly from '@/shared/lib/csrf'
// export { checkOrigin } from './csrf';

// Email
export { sendProposalEmail, sendPasswordResetEmail, sendRenewalReminder } from './email';

// Audit Logging
export { createAuditLog, AuditAction, logAudit } from './audit';
export type { AuditLogAction } from './audit';

// Safe wrappers
// Note: safeApi uses next/headers internally via dynamic imports
// Export only for server-side usage
export { createSafeAction, ActionError } from './safe-action';
// export { safeApi } from './safe-api';  // Commented out - import directly from './safe-api' in server routes
export type { ApiResponse } from './safe-api';

// Security - Note: some functions use Node.js crypto, import directly for server-only usage
export type { IdentificationResult } from './security';
// export { detectInvisibles, sanitizeHtml, constantTimeCompare } from './security';

// Auth Guard
export type { UserRole, AuthenticatedUser } from './auth-guard';
export { requireAuth } from './auth-guard';

// Config
export { validateEnv } from './env-validator';
