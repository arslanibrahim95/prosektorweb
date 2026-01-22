/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import { registerFonts } from '@/lib/pdf/fonts'

registerFonts()

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Roboto',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 20,
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerInfo: {
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#059669', // Emerald-600
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 4,
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    section: {
        flexDirection: 'column',
        width: '45%',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    text: {
        fontSize: 10,
        color: '#4B5563',
        marginBottom: 4,
        lineHeight: 1.5,
    },
    totals: {
        alignSelf: 'flex-end',
        width: '40%',
        marginTop: 20,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        paddingVertical: 4,
    },
    finalTotal: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 8,
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 10,
        color: '#6B7280',
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#111827',
    },
    totalValueLarge: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#059669',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 20,
    },
    footerText: {
        fontSize: 8,
        color: '#9CA3AF',
    },
    content: {
        marginBottom: 20,
    },
})

interface InvoiceDocumentProps {
    data: any
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ data }) => {
    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('tr-TR')
    }

    const formatCurrency = (amount: number, currency: string = 'TRY') => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency,
        }).format(amount)
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.logo}>PROSEKTOR</Text>
                        <Text style={styles.text}>Yazılım ve Danışmanlık Hizmetleri</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>FATURA</Text>
                        <Text style={styles.subtitle}>Fatura No: {data.invoiceNo}</Text>
                        <Text style={styles.subtitle}>Tarih: {formatDate(data.issueDate)}</Text>
                        <Text style={styles.subtitle}>Vade: {formatDate(data.dueDate)}</Text>
                        <Text style={styles.subtitle}>
                            Durum: {data.status === 'PAID' ? 'ÖDENDİ' : data.status === 'PARTIAL' ? 'KISMEN ÖDENDİ' : 'BEKLİYOR'}
                        </Text>
                    </View>
                </View>

                {/* Client & Provider Info */}
                <View style={styles.grid}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sayın / Firma</Text>
                        <Text style={[styles.text, { fontWeight: 'bold' }]}>{data.company?.name}</Text>
                        <Text style={styles.text}>{data.company?.address || 'Adres bilgisi girilmemiş'}</Text>
                        <Text style={styles.text}>{data.company?.email}</Text>
                        <Text style={styles.text}>{data.company?.phone}</Text>
                        {data.company?.taxNo && (
                            <Text style={styles.text}>VN: {data.company.taxNo} / {data.company.taxOffice}</Text>
                        )}
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Fatura Açıklaması</Text>
                        <Text style={styles.text}>{data.description}</Text>
                        {data.notes && (
                            <>
                                <Text style={styles.sectionTitle}>Notlar</Text>
                                <Text style={styles.text}>{data.notes}</Text>
                            </>
                        )}
                    </View>
                </View>

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Ara Toplam</Text>
                        <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>KDV (%{data.taxRate})</Text>
                        <Text style={styles.totalValue}>{formatCurrency(data.taxAmount)}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.finalTotal]}>
                        <Text style={[styles.totalLabel, { fontSize: 12, fontWeight: 'bold' }]}>GENEL TOPLAM</Text>
                        <Text style={styles.totalValueLarge}>{formatCurrency(data.total)}</Text>
                    </View>

                    {data.paidAmount > 0 && (
                        <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 10 }}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Ödenen Tutar</Text>
                                <Text style={styles.totalValue}>{formatCurrency(data.paidAmount)}</Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={[styles.totalLabel, { color: '#DC2626' }]}>Kalan Tutar</Text>
                                <Text style={[styles.totalValue, { color: '#DC2626' }]}>{formatCurrency(data.total - data.paidAmount)}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Bu belge elektronik ortamda oluşturulmuştur. Islak imza gerektirmez.
                        ProSektor Yazılım ve Danışmanlık Hizmetleri
                    </Text>
                </View>
            </Page>
        </Document>
    )
}
