import React from 'react'

export function JsonLd({ data }: { data: any }) {
    // Sanitize JSON-LD to prevent XSS while preserving valid JSON structure
    // We must escape '<' to prevent script injection attacks
    const sanitizedJson = JSON.stringify(data).replace(/</g, '\\u003c')

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: sanitizedJson
            }}
        />
    )
}
