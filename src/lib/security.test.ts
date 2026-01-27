import { describe, it, expect } from 'vitest';
import { canonicalizeUsername, detectInvisibles, sanitizeText } from './security';

describe('Security Library', () => {

    describe('detectInvisibles', () => {
        it('should detect zero-width spaces', () => {
            const input = 'ad\u200Bmin'; // admin + ZWSP
            expect(detectInvisibles(input)).toContain('INVISIBLE_FORMAT_CHARS');
        });

        it('should detect bidi controls', () => {
            const input = 'admin\u202Ereversed'; // RLO character
            expect(detectInvisibles(input)).toContain('BIDI_CONTROL_CHARS');
        });

        it('should return empty for clean input', () => {
            expect(detectInvisibles('admin')).toHaveLength(0);
        });
    });

    describe('canonicalizeUsername', () => {
        it('should strip zero-width characters (Impersonation Attack)', () => {
            // "admin" vs "admin[zero-width]"
            const clean = canonicalizeUsername('admin');
            const dirty = canonicalizeUsername('ad\u200Bmin');

            expect(dirty.canonical).toBe('admin');
            expect(clean.canonical).toBe(dirty.canonical); // Collision detected via canonical form
            expect(dirty.isValid).toBe(true); // Valid because we stripped it safely
        });

        it('should normalization NFKC (Full-width to ASCII)', () => {
            // ａｄｍｉｎ (Fullwidth Strings)
            const input = '\uFF41\uFF44\uFF4D\uFF49\uFF4E';
            const result = canonicalizeUsername(input);

            expect(result.canonical).toBe('admin');
            expect(result.isValid).toBe(true);
        });

        it('should REJECT Bidi controls (Spoofing Attack)', () => {
            const input = 'admin\u202Etxt.exe'; // Looks like exe.txt in some renderers
            const result = canonicalizeUsername(input);

            expect(result.isValid).toBe(false);
            expect(result.issues).toContain('BIDI_DETECTED');
        });

        it('should REJECT Homoglyphs (Cyrillic substitution)', () => {
            // Latin 'a' vs Cyrillic 'а' (U+0430)
            const latin = 'admin';
            const spoof = '\u0430dmin';

            const latinRes = canonicalizeUsername(latin);
            const spoofRes = canonicalizeUsername(spoof);

            expect(latinRes.isValid).toBe(true);

            // Should fail ASCII check
            expect(spoofRes.isValid).toBe(false);
            expect(spoofRes.issues).toContain('INVALID_CHARACTERS');
        });

        it('should handle uppercase', () => {
            const result = canonicalizeUsername('AdminUser');
            expect(result.canonical).toBe('adminuser');
            expect(result.isValid).toBe(true);
        });

        it('should validate patterns', () => {
            expect(canonicalizeUsername('ab').issues).toContain('TOO_SHORT');
            expect(canonicalizeUsername('user..name').issues).toContain('CONSECUTIVE_DOTS');
            expect(canonicalizeUsername('.username').issues).toContain('INVALID_DOT_PLACEMENT');
        });
    });

    describe('sanitizeText', () => {
        it('should just strip invisibles but keep unicode', () => {
            const input = 'Merhaba\u200B Dünyal\u0131'; // Contains ZWSP
            const cleaned = sanitizeText(input);
            expect(cleaned).toBe('Merhaba Dünyalı'); // ZWSP gone, Turkish chars kept
        });
    });
});
