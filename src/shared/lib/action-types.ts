// ==========================================
// STANDARD ACTION RESPONSE TYPES
// ==========================================

/**
 * Standard response type for all server actions.
 * Provides consistent error handling and type safety.
 * 
 * @example
 * // Success case
 * return { success: true, data: company }
 * 
 * // Error case
 * return { success: false, error: 'Firma bulunamadı.' }
 */
export type ActionResponse<T = unknown> =
    | { success: true; data: T; message?: string; meta?: { requestId: string } }
    | { success: false; error: string; code?: string; message?: string; meta?: { requestId: string } }

/**
 * Alias for ActionResponse for backward compatibility.
 * @deprecated Use ActionResponse instead.
 */
export type ActionResult<T = unknown> = ActionResponse<T>

/**
 * Paginated response type for list queries (Offset-based).
 * @deprecated Use CursorPaginatedResponse for new implementations.
 */
export type PaginatedResponse<T> = {
    data: T[]
    total: number
    pages: number
    currentPage: number
}

/**
 * Cursor-based paginated response type.
 */
export type CursorPaginatedResponse<T> = {
    data: T[]
    meta: {
        nextCursor: string | null
        limit: number
    }
}

/**
 * Type guard for checking if an error is an Error instance.
 * Safe way to extract error messages from unknown errors.
 * 
 * @example
 * catch (error: unknown) {
 *   const message = getErrorMessage(error)
 *   return { success: false, error: message }
 * }
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    if (typeof error === 'string') {
        return error
    }
    return 'Beklenmeyen bir hata oluştu.'
}

/**
 * Check if error is a Prisma unique constraint violation.
 */
export function isPrismaUniqueConstraintError(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
    )
}

/**
 * Extract first error message from ZodError.
 * Type-safe way to get validation error message.
 */
export function getZodErrorMessage(error: unknown): string {
    if (
        typeof error === 'object' &&
        error !== null &&
        'issues' in error &&
        Array.isArray((error as { issues: unknown[] }).issues) &&
        (error as { issues: { message: string }[] }).issues.length > 0
    ) {
        return (error as { issues: { message: string }[] }).issues[0].message
    }
    return 'Doğrulama hatası oluştu.'
}

// ==========================================
// PAGINATION VALIDATION
// ==========================================

/** Pagination configuration constants */
export const PAGINATION = {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
} as const

/**
 * Validates and normalizes pagination parameters for cursor-based pagination.
 * 
 * @param cursor - The cursor string (usually an ID or timestamp)
 * @param limit - Items per page
 * @returns Validated pagination parameters
 */
export function validatePagination(
    cursor?: string | null,
    limit?: number | string | null
): { cursor: string | undefined; limit: number } {
    // Validate cursor
    const validCursor = typeof cursor === 'string' && cursor.length > 0 ? cursor : undefined

    // Parse and validate limit
    let validLimit = typeof limit === 'string' ? parseInt(limit, 10) : (limit ?? PAGINATION.DEFAULT_LIMIT)
    if (isNaN(validLimit) || validLimit < 1) {
        validLimit = PAGINATION.DEFAULT_LIMIT
    }
    if (validLimit > PAGINATION.MAX_LIMIT) {
        validLimit = PAGINATION.MAX_LIMIT
    }

    return {
        cursor: validCursor,
        limit: validLimit,
    }
}
