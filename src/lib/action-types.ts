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
    | { success: true; data: T }
    | { success: false; error: string }

/**
 * Paginated response type for list queries.
 * 
 * @example
 * return {
 *   data: companies,
 *   total: 100,
 *   pages: 10,
 *   currentPage: 1
 * }
 */
export type PaginatedResponse<T> = {
    data: T[]
    total: number
    pages: number
    currentPage: number
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
