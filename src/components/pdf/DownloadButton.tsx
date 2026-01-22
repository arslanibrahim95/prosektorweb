'use client'

import React from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { FileDown, Loader2 } from 'lucide-react'

interface DownloadButtonProps {
    document: React.ReactElement
    fileName: string
    label?: string
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ document, fileName, label = 'PDF İndir' }) => {
    // Client-side rendering check needed for some environments, but 'use client' handles most
    // We use a button that triggers the download

    return (
        <PDFDownloadLink document={document} fileName={fileName}>
            {({ loading }) => (
                <button
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <FileDown className="w-4 h-4" />
                    )}
                    {loading ? 'Hazırlanıyor...' : label}
                </button>
            )}
        </PDFDownloadLink>
    )
}
