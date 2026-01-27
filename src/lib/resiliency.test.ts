import { describe, it, expect, vi } from 'vitest';
import { executeWithRetry, normalizeNumber, Result } from './resiliency';

describe('Resiliency Library', () => {

    describe('executeWithRetry', () => {
        it('should return data on first success', async () => {
            const fn = vi.fn().mockResolvedValue('success');
            const result = await executeWithRetry(fn);
            expect(result).toEqual({ ok: true, data: 'success' });
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should retry on failure and eventually succeed', async () => {
            const fn = vi.fn()
                .mockRejectedValueOnce(new Error('Transient error'))
                .mockResolvedValue('success');

            const result = await executeWithRetry(fn, {
                maxAttempts: 3,
                initialDelayMs: 10 // Fast for test
            });

            expect(result).toEqual({ ok: true, data: 'success' });
            expect(fn).toHaveBeenCalledTimes(2);
        });

        it('should fail after max attempts', async () => {
            const fn = vi.fn().mockRejectedValue(new Error('Persistent error'));

            const result = await executeWithRetry(fn, {
                maxAttempts: 3,
                initialDelayMs: 10
            });

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe('MAX_RETRIES');
            }
            expect(fn).toHaveBeenCalledTimes(3);
        });

        it('should handle timeouts', async () => {
            const slowFn = () => new Promise(resolve => setTimeout(resolve, 100));

            const result = await executeWithRetry(slowFn, {
                timeoutMs: 10,
                maxAttempts: 2,
                initialDelayMs: 10
            });

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe('MAX_RETRIES'); // Retries due to timeout
                // Or acts as error, eventually max retries
            }
        });

        it('should fail fast on 4xx (non-retryable logic check)', async () => {
            // Default logic relies on error code mainly, let's simulate a non-retryable by NOT having a retryable code/message
            const badRequest = new Error('Bad Request');
            (badRequest as any).code = 400; // 400 is not in standard retry list usually, but let's check implementation

            // Our current implementation is heuristic. 
            // "Bad Request" doesn't match 'timeout', 'network', 'rate limit' or Is 429/5xx.
            // So it should fail fast.

            const fn = vi.fn().mockRejectedValue(badRequest);
            const result = await executeWithRetry(fn, { maxAttempts: 3 });

            expect(result.ok).toBe(false);
            expect(fn).toHaveBeenCalledTimes(1); // Should not retry
        });

        it('should retry on 429', async () => {
            const rateLimit = new Error('Too Many Requests');
            (rateLimit as any).code = 429;

            const fn = vi.fn()
                .mockRejectedValueOnce(rateLimit)
                .mockResolvedValue('success');

            const result = await executeWithRetry(fn, { maxAttempts: 2, initialDelayMs: 10 });
            expect(result.ok).toBe(true);
            expect(fn).toHaveBeenCalledTimes(2);
        });
    });

    describe('normalizeNumber', () => {
        it('should handle undefined/null', () => {
            expect(normalizeNumber(undefined)).toBe(0);
            expect(normalizeNumber(null, 5)).toBe(5);
        });

        it('should parse simple numbers', () => {
            expect(normalizeNumber(10)).toBe(10);
            expect(normalizeNumber("10")).toBe(10);
            expect(normalizeNumber("10.5")).toBe(10.5);
        });

        it('should handle Turkish text inputs', () => {
            expect(normalizeNumber("sıfır")).toBe(0);
            expect(normalizeNumber("bir")).toBe(1);
        });

        it('should return default for garbage', () => {
            expect(normalizeNumber("abc")).toBe(0);
            expect(normalizeNumber("abc", -1)).toBe(-1);
        });

        it('should handle empty string', () => {
            expect(normalizeNumber("")).toBe(0);
        });
    });
});
