'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error
        console.error('Segment Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
            <h2 className="text-xl font-semibold mb-4">Bir şeyler ters gitti!</h2>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 transition-colors"
            >
                Tekrar Dene
            </button>
        </div>
    );
}
