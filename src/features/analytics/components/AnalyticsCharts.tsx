'use client'

import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    Tooltip, CartesianGrid, PieChart, Pie, Cell
} from 'recharts'

interface TrafficChartProps {
    data: { date: string; visitors: number; pageViews: number }[]
}

export function TrafficChart({ data }: TrafficChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#b91c1c" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#b91c1c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                    dataKey="date"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                    contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="visitors"
                    name="Ziyaretçi"
                    stroke="#b91c1c"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVisitors)"
                />
                <Area
                    type="monotone"
                    dataKey="pageViews"
                    name="Sayfa Görüntüleme"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPageViews)"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

interface DeviceChartProps {
    mobile: number
    desktop: number
    tablet: number
}

const COLORS = ['#b91c1c', '#2563eb', '#059669']

export function DeviceChart({ mobile, desktop, tablet }: DeviceChartProps) {
    const data = [
        { name: 'Mobil', value: mobile },
        { name: 'Masaüstü', value: desktop },
        { name: 'Tablet', value: tablet },
    ]

    return (
        <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => [`%${(value as number)?.toFixed(1) ?? '0'}`, '']} />
            </PieChart>
        </ResponsiveContainer>
    )
}

interface TrafficSourcesProps {
    sources: { name: string; percent: number }[]
}

const SOURCE_COLORS: Record<string, string> = {
    'Google': '#4285f4',
    'Direkt': '#34a853',
    'Sosyal Medya': '#ea4335',
    'Referans': '#fbbc05',
}

export function TrafficSources({ sources }: TrafficSourcesProps) {
    return (
        <div className="space-y-3">
            {sources.map((source) => (
                <div key={source.name}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-700">{source.name}</span>
                        <span className="font-medium text-neutral-900">%{source.percent}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${source.percent}%`,
                                backgroundColor: SOURCE_COLORS[source.name] || '#6b7280'
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

interface PerformanceGaugeProps {
    score: number
    label: string
    maxScore?: number
}

export function PerformanceGauge({ score, label, maxScore = 100 }: PerformanceGaugeProps) {
    const percentage = (score / maxScore) * 100
    const color = percentage >= 90 ? '#059669' : percentage >= 50 ? '#f59e0b' : '#dc2626'

    return (
        <div className="text-center">
            <div className="relative w-20 h-20 mx-auto">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                    />
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeDasharray={`${percentage}, 100`}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-neutral-900">{score}</span>
                </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">{label}</p>
        </div>
    )
}
