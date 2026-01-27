import { getAdminDashboardStats, getRecentActivities, RecentActivity } from '@/features/system/actions/dashboard'
import Link from 'next/link'
import * as motion from "motion/react-client"
import {
    Building2, Users, Layers, MessageSquare, FileText,
    TrendingUp, TrendingDown, AlertTriangle, Clock,
    ArrowRight, Plus, Eye, Database, Server, Globe, Shield,
    DollarSign, Briefcase, Activity as ActivityIcon,
    Wallet, CreditCard, PieChart
} from 'lucide-react'
import SpotlightCard from '@/components/ui/SpotlightCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { DashboardChart } from '@/features/system/components/DashboardChart'

export const revalidate = 60; // Cache this page for 1 minute

export default async function SuperAdminDashboard() {
    const stats = await getAdminDashboardStats()
    const recentActivities = await getRecentActivities(8)

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
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 font-serif tracking-tight">Yönetim Paneli</h1>
                    <p className="text-neutral-500 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Sistem genelinde canlı performans ve aktivite özeti
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold bg-white px-5 py-2.5 rounded-2xl border border-neutral-200 text-neutral-700 shadow-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-500" />
                        {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </motion.div>

            {/* Database Error Alert */}
            {stats.error && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4"
                >
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-red-800">Veri Bağlantı Hatası</h3>
                        <p className="text-sm text-red-600">Veritabanına erişilemiyor. Gösterilen veriler önbellekten gelmiş olabilir.</p>
                    </div>
                </motion.div>
            )}

            {/* FINANCIAL PULSE */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <motion.div variants={item}>
                    <SpotlightCard className="border-neutral-200 bg-white" spotlightColor="rgba(34, 197, 94, 0.1)">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700 px-2 py-1 rounded-lg">Ciro</span>
                        </div>
                        <div className="text-3xl font-bold text-neutral-900 mb-1 leading-none">{formatCurrency(stats.totalRevenue)}</div>
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Tahsil Edilen Toplam</div>
                    </SpotlightCard>
                </motion.div>

                <motion.div variants={item}>
                    <SpotlightCard className="border-neutral-200 bg-white" spotlightColor="rgba(249, 115, 22, 0.1)">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">Alacak</span>
                        </div>
                        <div className="text-3xl font-bold text-neutral-900 mb-1 leading-none">{formatCurrency(stats.outstandingReceivables)}</div>
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Bekleyen Faturalar</div>
                    </SpotlightCard>
                </motion.div>

                {/* REMOVED: Monthly MRR Projection (Advanced) */}

            </motion.div>

            {/* CHART SECTION */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm overflow-hidden relative"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-neutral-900">Finansal Akış</h3>
                        <p className="text-sm text-neutral-500">Son 6 aylık tahsilat ve alacak dengesi</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span className="text-xs font-bold text-neutral-600 uppercase">Tahsilat</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full" />
                            <span className="text-xs font-bold text-neutral-600 uppercase">Bekleyen</span>
                        </div>
                    </div>
                </div>
                <DashboardChart data={stats.chartData} />
            </motion.div>

            {/* MAIN STATS GRID */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <StatsCard
                    href="/admin/companies"
                    icon={Building2}
                    label="Firma"
                    value={stats.companies}
                    color="brand"
                />
                <StatsCard
                    href="/admin/workplaces"
                    icon={Layers}
                    label="İşyeri"
                    value={stats.workplaces}
                    color="purple"
                />
                <StatsCard
                    href="/admin/projects"
                    icon={Briefcase}
                    label="Proje"
                    value={stats.pendingProjects}
                    color="amber"
                    badge="Süreçte"
                />
                <StatsCard
                    href="/admin/tickets"
                    icon={MessageSquare}
                    label="Destek"
                    value={stats.activeTickets}
                    color="red"
                    badge="Açık"
                />
            </motion.div>

            {/* QUICK ACTIONS (Hero for Mid-Level) */}
            <div className="bg-neutral-50 rounded-3xl border border-neutral-200 p-8 shadow-sm text-center">
                <h3 className="text-lg font-bold text-neutral-900 mb-6 font-serif">Hızlı İşlemler</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                    <QuickAction href="/admin/invoices/new" icon={DollarSign} label="Fatura Kes" color="green" />
                    <QuickAction href="/admin/companies/new" icon={Plus} label="Firma Ekle" color="brand" />
                    <QuickAction href="/admin/tickets" icon={MessageSquare} label="Destek Talebi" color="red" />
                    <QuickAction href="/admin/users/new" icon={Users} label="Kullanıcı Davet Et" color="purple" />
                </div>
            </div>

        </div>
    )
}
        </div >
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
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 group-hover:border-transparent group-hover:shadow-xl group-hover:shadow-neutral-200/50 transition-all h-full relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${colors[color]} group-hover:text-white`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {badge && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-neutral-100 text-neutral-500 px-2 py-1 rounded-lg">
                            {badge}
                        </span>
                    )}
                </div>
                <div className="text-3xl font-bold text-neutral-900 tracking-tight">{value}</div>
                <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mt-1 group-hover:text-neutral-500 transition-colors">{label}</p>
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
