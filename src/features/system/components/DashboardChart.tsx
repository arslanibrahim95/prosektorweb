'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTranslations } from 'next-intl'

interface DashboardChartProps {
    data: { name: string; revenue: number; receivables: number }[]
}

export function DashboardChart({ data }: DashboardChartProps) {
    const t = useTranslations('AdminDashboard')

    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
                <p className="text-neutral-400 text-sm">{t('chart_no_data')}</p>
            </div>
        )
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#737373', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#737373', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            border: '1px solid #E5E5E5',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        cursor={{ fill: '#F5F5F5' }}
                    />
                    <Bar
                        dataKey="revenue"
                        name={t('chart_collected')}
                        fill="#10B981"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                    <Bar
                        dataKey="receivables"
                        name={t('chart_pending')}
                        fill="#F59E0B"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
