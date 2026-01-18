import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { InvoiceForm } from '@/components/admin/InvoiceForm'
import { generateInvoiceNo } from '@/actions/invoice'
import { prisma } from '@/lib/prisma'

export default async function NewInvoicePage() {
    // Fetch companies for dropdown
    const companies = await prisma.company.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    })

    // Generate next invoice number
    const invoiceNo = await generateInvoiceNo()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/invoices"
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Yeni Fatura</h1>
                    <p className="text-neutral-500 mt-1">Firmaya yeni fatura oluşturun</p>
                </div>
            </div>

            {/* Form */}
            <InvoiceForm companies={companies} initialInvoiceNo={invoiceNo} />
        </div>
    )
}
