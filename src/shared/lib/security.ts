import crypto from 'crypto'

/**
 * @file src/lib/security.ts
 * @description Unicode security and input sanitization to prevent impersonation/homoglyph attacks.
 * @invariants Usernames are strictly ASCII [a-z0-9._] after normalization.
 */

export interface IdentificationResult {
    raw: string;
    canonical: string;
    isValid: boolean;
    issues: string[];
}

/**
 * Regex for dangerous invisible/format characters to STRIP.
 * Includes:
 * - Zero-width spaces (U+200B - U+200D)
 * - Byte Order Mark (U+FEFF)
 * - Word Joiner (U+2060)
 * - Invisible separators
 */
const INVISIBLE_CHARS_REGEX = /[\u200B-\u200D\uFEFF\u2060-\u206F]/g;

/**
 * Regex for Bidi control characters to REJECT (too dangerous to just strip).
 * Includes:
 * - Right-to-Left Override (U+202E)
 * - Embedding/Isolation chars (U+202A-U+202D, U+2066-U+2069)
 */
const BIDI_CONTROL_REGEX = /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

/**
 * Audit: Detect if input contains dangerous characters.
 */
export function detectInvisibles(input: string): string[] {
    const detected: string[] = [];

    // Check invisibles
    const invisibles = input.match(INVISIBLE_CHARS_REGEX);
    if (invisibles) {
        detected.push('INVISIBLE_FORMAT_CHARS');
    }

    // Check Bidi
    const bidi = input.match(BIDI_CONTROL_REGEX);
    if (bidi) {
        detected.push('BIDI_CONTROL_CHARS');
    }

    return detected;
}

/**
 * Canonicalize and Validate Username
 * Policy:
 * 1. Normalize NFKC (Kompatibility composition)
 * 2. Strip standard invisibles (Zero-width, etc.)
 * 3. Reject Bidi controls (Spoofing risk)
 * 4. Lowercase
 * 5. Enforce STRICT ASCII allowed set [a-z0-9._] -> Effectively prevents Homoglyphs
 */
export function canonicalizeUsername(input: string): IdentificationResult {
    const issues: string[] = [];

    // 0. Handle empty
    if (!input || !input.trim()) {
        return { raw: input, canonical: '', isValid: false, issues: ['EMPTY_INPUT'] };
    }

    // 1. Normalize NFKC
    let processing = input.normalize('NFKC');

    // 2. Reject Bidi (Fast Fail)
    if (BIDI_CONTROL_REGEX.test(processing)) {
        return {
            raw: input,
            canonical: '',
            isValid: false,
            issues: ['BIDI_DETECTED']
        };
    }

    // 3. Strip Invisibles
    processing = processing.replace(INVISIBLE_CHARS_REGEX, '');

    // 4. Lowercase & Trim
    processing = processing.toLowerCase().trim();

    // 5. Enforce Allowed Chars (ASCII Alphanumeric + dot + underscore)
    // This blocks Cyrillic/Greek homoglyphs effectively for this MVP policy.
    const ALLOWED_CHARS_REGEX = /^[a-z0-9._]+$/;

    if (!ALLOWED_CHARS_REGEX.test(processing)) {
        issues.push('INVALID_CHARACTERS');
    }

    // 6. Length & Pattern rules (basic)
    if (processing.length < 3) issues.push('TOO_SHORT');
    if (processing.length > 30) issues.push('TOO_LONG');
    if (processing.startsWith('.') || processing.endsWith('.')) issues.push('INVALID_DOT_PLACEMENT');
    if (processing.includes('..')) issues.push('CONSECUTIVE_DOTS');

    return {
        raw: input,
        canonical: processing,
        isValid: issues.length === 0,
        issues
    };
}

/**
 * Sanitize General Text (e.g. Bio, Description)
 * Less strict than username. Strips invisibles but allows unicode.
 */
export function sanitizeText(input: string): string {
    if (!input) return '';
    return input
        .normalize('NFKC')
        .replace(INVISIBLE_CHARS_REGEX, '')
        .trim();
}

export { sanitizeHtml } from './sanitize'

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function constantTimeCompare(a: string, b: string): boolean {
    try {
        const bufA = Buffer.from(a)
        const bufB = Buffer.from(b)

        if (bufA.length !== bufB.length) {
            // Still perform a comparison to maintain similar timing even if lengths differ
            crypto.timingSafeEqual(bufA, bufA)
            return false
        }

        return crypto.timingSafeEqual(bufA, bufB)
    } catch {
        return false
    }
}
