import { getAdminDashboardStats, getRecentActivities, RecentActivity } from '@/features/system/actions/dashboard'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import * as motion from "motion/react-client"
import {
    Building2, Users, Layers, MessageSquare, FileText,
    TrendingUp, TrendingDown, AlertTriangle, Clock,
    ArrowRight, Plus, Eye, Database, Server, Globe, Shield,
    DollarSign, Briefcase, Activity as ActivityIcon,
    Wallet, CreditCard, PieChart, Settings,
    Zap, Target, Users as UsersIcon, CheckCircle, XCircle, Rocket
} from 'lucide-react'
import { SpotlightCard } from '@/shared/components/ui'
import { GradientButton } from '@/shared/components/ui'
import { DashboardChart } from '@/features/system/components/DashboardChart'

export const revalidate = 60; // Cache this page for 1 minute

export default async function SuperAdminDashboard() {
    const stats = await getAdminDashboardStats()
    const recentActivities = await getRecentActivities(8)
    const t = await getTranslations('AdminDashboard')

    // Quick currency formatter
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount)

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="space-y-10 pb-16">
                {/* Page Header - Command Center Style */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-brand-600 font-black text-xs uppercase tracking-[.3em]">
                            <Shield className="w-4 h-4" />
                            {t('command_center')}
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-neutral-900 tracking-tighter">
                            {t('title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">{t('title_highlight')}</span>
                        </h1>
                        <p className="text-neutral-500 text-lg max-w-2xl font-medium">
                            {t('subtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex flex-col items-end mr-4">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t('system_time')}</span>
                            <span className="text-sm font-mono font-bold text-neutral-900">
                                {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="bg-white p-1 rounded-2xl border border-neutral-200 shadow-xl shadow-neutral-200/40 flex items-center gap-1">
                            <span className="px-4 py-2 text-sm font-bold text-neutral-700">{t('live_monitor')}</span>
                            <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center animate-pulse">
                                <ActivityIcon className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* FINANCIAL PULSE - Premium Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div variants={item} className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-neutral-200 p-6 h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6">
                                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                    <TrendingUp className="w-7 h-7" />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3 block">{t('total_revenue')}</span>
                                <div className="text-5xl font-bold text-neutral-900 mb-5 tracking-tight">
                                    {formatCurrency(stats.totalRevenue)}
                                </div>

                                <div className="grid grid-cols-2 gap-6 border-t border-neutral-100 pt-5">
                                    <div>
                                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1 block">{t('outstanding')}</span>
                                        <div className="text-xl font-semibold text-orange-600">{formatCurrency(stats.outstandingReceivables)}</div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1 block">{t('monthly_target')}</span>
                                        <div className="text-xl font-semibold text-brand-600">{formatCurrency(stats.mrr)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-emerald-500" />
                        </div>
                    </motion.div>

                    <div className="space-y-4">
                        <StatsCard href="/admin/companies" icon={Building2} label={t('active_clients')} value={stats.companies} color="brand" />
                        <StatsCard href="/admin/projects" icon={Briefcase} label={t('active_generation')} value={stats.pendingProjects} color="purple" badge={t('process')} />
                    </div>
                </div>

                {/* AI PRODUCTION LINE & CHART */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* CHART */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3 bg-neutral-900 rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 blur-[100px] rounded-full -mr-32 -mt-32" />

                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold text-white">{t('revenue_analysis')}</h3>
                                <p className="text-sm text-neutral-400">{t('revenue_desc')}</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/10">
                                <div className="flex items-center gap-2 px-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    <span className="text-[10px] font-bold text-neutral-300 uppercase">{t('legend_revenue')}</span>
                                </div>
                                <div className="flex items-center gap-2 px-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                    <span className="text-[10px] font-bold text-neutral-300 uppercase">{t('legend_receivables')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 invert brightness-150 contrast-125 opacity-90">
                            <DashboardChart data={stats.chartData} />
                        </div>
                    </motion.div>

                    {/* ISG EXPERTISE METRICS */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900">İş Güvenliği Uzmanlığı</h3>
                                <p className="text-sm text-neutral-500">11 yıllık deneyim ve uzmanlık</p>
                            </div>
                            <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <MetricCard icon={Globe} label="Canlı" value={stats.aiGeneratedSites} color="emerald" />
                            <MetricCard icon={Clock} label="Bekleyen" value={stats.aiPendingGeneration} color="amber" />
                            <MetricCard icon={CheckCircle} label="Onaylanan" value={stats.aiCompletedToday} color="brand" />
                            <MetricCard icon={Target} label="Kazanma %" value={`${stats.proposalWinRate}`} color="purple" />
                        </div>

                        {/* Recent Activities */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Son Aktiviteler</span>
                            {recentActivities.filter((a: RecentActivity) => a.entity === 'WebProject' || a.action === 'CREATE').slice(0, 4).map((activity: RecentActivity) => (
                                <div key={activity.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors group">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.action === 'CREATE' ? 'bg-green-100 text-green-600' : 'bg-brand-100 text-brand-600'}`}>
                                        {activity.entity === 'WebProject' ? <Globe className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-neutral-900 text-xs truncate">{activity.details?.name || activity.entity}</div>
                                        <div className="text-[10px] font-bold text-neutral-400 uppercase">{new Date(activity.createdAt).toLocaleDateString('tr-TR')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link href="/admin/audit" className="flex items-center justify-center gap-2 w-full py-3 mt-4 text-sm font-bold text-neutral-400 hover:text-brand-600 transition-colors">
                            {t('view_all')} <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>

                {/* QUICK ACTIONS - Command Style */}
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10" />
                    <div className="relative z-10 flex flex-col items-center">
                        <h3 className="text-2xl font-black text-white mb-10 tracking-tight">{t('quick_actions')}</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
                            <QuickAction href="/admin/invoices/new" icon={DollarSign} label={t('action_new_invoice')} color="green" />
                            <QuickAction href="/admin/companies/new" icon={Plus} label={t('action_new_company')} color="brand" />
                            <QuickAction href="/admin/projects" icon={Globe} label={t('action_ai_generate')} color="purple" />
                            <QuickAction href="/admin/settings" icon={Settings} label={t('action_settings')} color="neutral" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- SUB-COMPONENTS ---

function StatsCard({ href, icon: Icon, label, value, color, badge }: any) {
    const colors: any = {
        brand: "bg-brand-50 text-brand-600 group-hover:bg-brand-600",
        purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600",
        amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-600",
        red: "bg-red-50 text-red-600 group-hover:bg-red-600",
    }

    return (
        <Link href={href} className="group">
            <div className="bg-white p-5 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all h-full">
                <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${colors[color]} group-hover:text-white`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {badge && (
                        <span className="text-[10px] font-medium uppercase tracking-wide bg-neutral-100 text-neutral-500 px-2 py-1 rounded-md">
                            {badge}
                        </span>
                    )}
                </div>
                <div className="text-2xl font-semibold text-neutral-900 tracking-tight">{value}</div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mt-1">{label}</p>
            </div>
        </Link>
    )
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
    const actionMap: any = {
        CREATE: { color: 'bg-green-500', label: 'Yeni Kayıt' },
        UPDATE: { color: 'bg-blue-500', label: 'Güncelleme' },
        DELETE: { color: 'bg-red-500', label: 'Silme' },
        LOGIN: { color: 'bg-purple-500', label: 'Giriş' },
    }

    const config = actionMap[activity.action] || { color: 'bg-neutral-400', label: activity.action }

    return (
        <div className="p-5 flex items-start gap-4 hover:bg-neutral-50/50 transition-colors group">
            <div className="relative mt-1">
                <div className={`w-3 h-3 rounded-full ${config.color} border-4 border-white shadow-sm ring-1 ring-neutral-200`} />
                <div className="absolute top-3 left-1.5 w-0.5 h-12 bg-neutral-100 group-last:hidden" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-0.5">
                    <p className="text-sm font-bold text-neutral-800 truncate">
                        {activity.entity} : <span className="font-normal text-neutral-500">{activity.details ? JSON.parse(JSON.stringify(activity.details)).name || activity.entity : activity.entity}</span>
                    </p>
                    <span className="text-[10px] font-black text-neutral-300 uppercase tracking-wider whitespace-nowrap">
                        {new Date(activity.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${config.color.replace('bg-', 'text-').replace('500', '600')} bg-neutral-50`}>
                        {config.label}
                    </span>
                    <span className="text-xs text-neutral-400 truncate">
                        {activity.userEmail || 'Sistem'}
                    </span>
                </div>
            </div>
        </div>
    )
}

function QuickAction({ href, icon: Icon, label, color }: any) {
    const colors: any = {
        brand: "group-hover:bg-brand-600 group-hover:text-white text-brand-600 bg-brand-50",
        purple: "group-hover:bg-purple-600 group-hover:text-white text-purple-600 bg-purple-50",
        green: "group-hover:bg-green-600 group-hover:text-white text-green-600 bg-green-50",
        red: "group-hover:bg-red-600 group-hover:text-white text-red-600 bg-red-50",
        neutral: "group-hover:bg-neutral-600 group-hover:text-white text-neutral-600 bg-neutral-50",
    }

    return (
        <Link href={href} className="flex flex-col items-center justify-center p-5 bg-white border border-neutral-200 rounded-3xl hover:border-transparent hover:shadow-xl hover:shadow-neutral-200/50 transition-all group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all transform group-hover:scale-110 ${colors[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">{label}</span>
        </Link>
    )
}

function MetricCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
    const colors: any = {
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        brand: "bg-brand-50 text-brand-600",
        purple: "bg-purple-50 text-purple-600",
    }

    return (
        <div className="bg-neutral-50 rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <div className="text-xl font-bold text-neutral-900">{value}</div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{label}</div>
            </div>
        </div>
    )
}

function HealthRow({ label, status, active }: any) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500 font-medium">{label}</span>
            <span className={`${active ? 'text-green-400' : 'text-neutral-400'} font-bold font-mono text-xs uppercase tracking-widest`}>
                {status}
            </span>
        </div>
    )
}
