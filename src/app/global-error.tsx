'use client';

import { useEffect } from 'react';
import { logger } from '@/shared/lib';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error using our structured logger (client<->server bridge needed in real app, here console)
        // In a real production app, we should send this to an API route to log to server-side stdout
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 text-neutral-900">
                    <h2 className="text-2xl font-bold mb-4">Bir şeyler ters gitti!</h2>
                    <p className="mb-6 text-neutral-600">Kritik bir hata oluştu.</p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 transition-colors"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </body>
        </html>
    );
}
