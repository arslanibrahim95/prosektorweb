'use client'

import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import { cn } from '@/lib/utils'

// Color palette for charts
const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']

// ==================== Line Chart ====================
interface LineChartProps {
    data: Array<Record<string, unknown>>
    xAxisKey: string
    lines: Array<{
        dataKey: string
        name: string
        color?: string
    }>
    className?: string
    height?: number
    showGrid?: boolean
    showLegend?: boolean
}

export function DashboardLineChart({
    data,
    xAxisKey,
    lines,
    className,
    height = 300,
    showGrid = true,
    showLegend = true
}: LineChartProps) {
    return (
        <div className={cn("w-full", className)}>
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
                    <XAxis
                        dataKey={xAxisKey}
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => formatNumber(value as number)}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    {showLegend && (
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                    )}
                    {lines.map((line, index) => (
                        <Line
                            key={line.dataKey}
                            type="monotone"
                            dataKey={line.dataKey}
                            name={line.name}
                            stroke={line.color || CHART_COLORS[index % CHART_COLORS.length]}
                            strokeWidth={2}
                            dot={{ fill: line.color || CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

// ==================== Area Chart ====================
interface AreaChartProps {
    data: Array<Record<string, unknown>>
    xAxisKey: string
    areas: Array<{
        dataKey: string
        name: string
        color?: string
        gradient?: boolean
    }>
    className?: string
    height?: number
    stacked?: boolean
}

export function DashboardAreaChart({
    data,
    xAxisKey,
    areas,
    className,
    height = 300,
    stacked = false
}: AreaChartProps) {
    return (
        <div className={cn("w-full", className)}>
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        {areas.map((area, index) => {
                            const color = area.color || CHART_COLORS[index % CHART_COLORS.length]
                            return (
                                <linearGradient key={area.dataKey} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            )
                        })}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey={xAxisKey}
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => formatNumber(value as number)}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    {areas.map((area, index) => {
                        const color = area.color || CHART_COLORS[index % CHART_COLORS.length]
                        return (
                            <Area
                                key={area.dataKey}
                                type="monotone"
                                dataKey={area.dataKey}
                                name={area.name}
                                stroke={color}
                                strokeWidth={2}
                                fill={area.gradient !== false ? `url(#gradient-${area.dataKey})` : color}
                                fillOpacity={area.gradient !== false ? 1 : 0.3}
                                stackId={stacked ? 'stack' : undefined}
                            />
                        )
                    })}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

// ==================== Bar Chart ====================
interface BarChartProps {
    data: Array<Record<string, unknown>>
    xAxisKey: string
    bars: Array<{
        dataKey: string
        name: string
        color?: string
    }>
    className?: string
    height?: number
    layout?: 'horizontal' | 'vertical'
}

export function DashboardBarChart({
    data,
    xAxisKey,
    bars,
    className,
    height = 300,
    layout = 'horizontal'
}: BarChartProps) {
    return (
        <div className={cn("w-full", className)}>
            <ResponsiveContainer width="100%" height={height}>
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout={layout}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={layout === 'horizontal'} />
                    {layout === 'horizontal' ? (
                        <>
                            <XAxis dataKey={xAxisKey} stroke="#9ca3af" fontSize={12} tickLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                        </>
                    ) : (
                        <>
                            <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} />
                            <YAxis dataKey={xAxisKey} type="category" stroke="#9ca3af" fontSize={12} tickLine={false} />
                        </>
                    )}
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    {bars.map((bar, index) => (
                        <Bar
                            key={bar.dataKey}
                            dataKey={bar.dataKey}
                            name={bar.name}
                            fill={bar.color || CHART_COLORS[index % CHART_COLORS.length]}
                            radius={[4, 4, 0, 0]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

// ==================== Pie/Donut Chart ====================
interface PieChartData {
    name: string
    value: number
    color?: string
}

interface PieChartProps {
    data: PieChartData[]
    className?: string
    height?: number
    innerRadius?: number
    showLegend?: boolean
    centerText?: string
    centerValue?: string | number
}

export function DashboardPieChart({
    data,
    className,
    height = 300,
    innerRadius = 0,
    showLegend = true,
    centerText,
    centerValue
}: PieChartProps) {
    return (
        <div className={cn("w-full relative", className)}>
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius="80%"
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    {showLegend && (
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            iconType="circle"
                            formatter={(value) => <span className="text-sm text-muted-foreground">{String(value)}</span>}
                        />
                    )}
                </PieChart>
            </ResponsiveContainer>

            {/* Center Text */}
            {centerText && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        {centerValue && (
                            <div className="text-3xl font-bold text-foreground">{centerValue}</div>
                        )}
                        <div className="text-sm text-muted-foreground">{centerText}</div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ==================== Revenue Chart (Specialized) ====================
interface RevenueChartData {
    month: string
    revenue: number
    target: number
}

interface RevenueChartProps {
    data: RevenueChartData[]
    className?: string
    height?: number
}

export function RevenueChart({ data, className, height = 350 }: RevenueChartProps) {
    return (
        <div className={cn("w-full bg-white rounded-3xl p-6", className)}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-neutral-900">Gelir Analizi</h3>
                    <p className="text-sm text-muted-foreground">Son 12 aylık performans verisi</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-brand-500" />
                        <span className="text-xs text-muted-foreground">Gelir</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-xs text-muted-foreground">Hedef</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={height}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                        dataKey="month"
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₺${formatCompactNumber(value as number)}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: unknown) => [`₺${formatNumber(value as number)}`, '']}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fill="url(#colorRevenue)"
                    />
                    <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

// ==================== Helper Functions ====================
function formatNumber(value: number): string {
    return new Intl.NumberFormat('tr-TR').format(value)
}

function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat('tr-TR', {
        notation: 'compact',
        compactDisplay: 'short'
    }).format(value)
}
