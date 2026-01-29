import DOMPurify from 'isomorphic-dompurify'

/**
 * Strict HTML Sanitization Configuration
 * Used for preventing XSS in content rendered from DB/User Input
 */
const STRICT_CONFIG = {
    ALLOWED_TAGS: [
        'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
        'img', 'span', 'div', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: [
        'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id', 'width', 'height'
    ],
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'svg', 'math', 'base'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover'],
    // Defense in depth against javascript: void(0) etc
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
}

const EXTENDED_CONFIG = {
    ...STRICT_CONFIG,
    ADD_TAGS: ['iframe'], // Only if we explicitly allow embeds (e.g. Youtube) in separate context
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
}

export function sanitizeHtml(html: string, strict = true): string {
    if (!html) return ''

    // Prevent double sanitization issues or weird encoding attacks
    // But DOMPurify handles most.

    return DOMPurify.sanitize(html, strict ? STRICT_CONFIG : EXTENDED_CONFIG) as string
}
