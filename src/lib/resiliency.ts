import { logger } from "@/lib/logger";

export type Result<T, E = AppError> =
    | { ok: true; data: T }
    | { ok: false; error: E };

export interface AppError {
    code: string;
    message: string;
    details?: any;
    isRetryable: boolean;
}

export interface RetryOptions {
    maxAttempts?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    timeoutMs?: number;
    backoffFactor?: number;
    name?: string; // For logging
}

/**
 * Execute a function with retries, exponential backoff, jitter, and timeout.
 */
export async function executeWithRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<Result<T>> {
    const {
        maxAttempts = 3,
        initialDelayMs = 1000,
        maxDelayMs = 10000,
        timeoutMs = 30000,
        backoffFactor = 2,
        name = 'operation'
    } = options;

    let attempt = 1;
    let delay = initialDelayMs;

    while (attempt <= maxAttempts) {
        try {
            // Create a timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
            });

            // Race the function against the timeout
            const data = await Promise.race([fn(), timeoutPromise]);
            return { ok: true, data };

        } catch (error: any) {
            const isLastAttempt = attempt === maxAttempts;
            const isRetryable = isRetryableError(error);

            // Log the failure
            logger.warn({
                operation: name,
                attempt,
                error: error.message,
                retryable: isRetryable
            }, `Operation failed (Attempt ${attempt}/${maxAttempts})`);

            if (isLastAttempt || !isRetryable) {
                return {
                    ok: false,
                    error: {
                        code: error.code || 'OPERATION_FAILED',
                        message: error.message || 'Unknown error',
                        details: error,
                        isRetryable
                    }
                };
            }

            // Calculate backoff with jitter
            // Jitter helps prevent "thundering herd"
            const jitter = Math.random() * 0.2 + 0.9; // 0.9 - 1.1
            const waitTime = Math.min(delay * jitter, maxDelayMs);

            await new Promise(resolve => setTimeout(resolve, waitTime));

            delay *= backoffFactor;
            attempt++;
        }
    }

    return {
        ok: false,
        error: { code: 'MAX_RETRIES', message: 'Max retries exceeded', isRetryable: true }
    };
}

/**
 * Heuristic to determine if an error is retryable
 */
function isRetryableError(error: any): boolean {
    if (!error) return false;

    // Check known codes
    const code = error.code || error.statusCode; // Axiom/Fetch/Node
    // 429: Too Many Requests
    // 5xx: Server Errors
    // ECONNRESET, ETIMEDOUT: Network
    if (['ETIMEDOUT', 'ECONNRESET', 'EPIPE', 'ENOTFOUND'].includes(code)) return true;
    if (typeof code === 'number' && (code === 429 || code >= 500)) return true;

    // Simple string matching for generic errors
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('timeout') || msg.includes('network') || msg.includes('rate limit')) return true;

    return false;
}

/**
 * Normalize Input (0 vs "0" vs "sıfır")
 */
export function normalizeNumber(input: string | number | undefined | null, defaultValue: number = 0): number {
    if (input === undefined || input === null) return defaultValue;
    if (typeof input === 'number') return input;

    const str = String(input).trim().toLowerCase();
    if (str === '') return defaultValue;
    if (str === 'sıfır') return 0;
    if (str === 'bir') return 1;

    const parsed = Number(input);
    return isNaN(parsed) ? defaultValue : parsed;
}
