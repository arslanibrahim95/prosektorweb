import React from 'react'
import { headers } from 'next/headers'

export function JsonLd({ data, nonce }: { data: unknown; nonce?: string }) {
    // Sanitize JSON-LD to prevent XSS while preserving valid JSON structure
    // We must escape '<' to prevent script injection attacks
    const sanitizedJson = JSON.stringify(data).replace(/</g, '\\u003c')
    const resolvedNonce = nonce ?? headers().get('x-nonce') ?? undefined

    return (
        <script
            type="application/ld+json"
            nonce={resolvedNonce}
            dangerouslySetInnerHTML={{
                __html: sanitizedJson
            }}
        />
    )
}
