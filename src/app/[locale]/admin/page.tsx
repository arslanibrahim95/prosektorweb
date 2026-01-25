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

                <motion.div variants={item}>
                    <SpotlightCard className="border-neutral-200 bg-white" spotlightColor="rgba(59, 130, 246, 0.1)">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <PieChart className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">Aylık Tahmin</span>
                        </div>
                        <div className="text-3xl font-bold text-neutral-900 mb-1 leading-none">{formatCurrency(stats.mrr)}</div>
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">MRR (Projeksiyon)</div>
                    </SpotlightCard>
                </motion.div>
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

            {/* DASHBOARD CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN (2/3) - Activity */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/30">
                            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                <ActivityIcon className="w-5 h-5 text-brand-600" />
                                Son Aktiviteler
                            </h3>
                            <Link href="/admin/audit" className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline uppercase tracking-wider">
                                Tümünü Gör
                            </Link>
                        </div>
                        <div className="divide-y divide-neutral-100">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity, idx) => (
                                    <ActivityItem key={activity.id} activity={activity} />
                                ))
                            ) : (
                                <div className="p-16 text-center text-neutral-400">
                                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">Henüz kayıtlı aktivite yok</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-neutral-50 rounded-3xl border border-neutral-200 p-6">
                        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">Hızlı Erişim</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <QuickAction href="/admin/companies/new" icon={Plus} label="Firma Ekle" color="brand" />
                            <QuickAction href="/admin/users/new" icon={Users} label="Kullanıcı" color="purple" />
                            <QuickAction href="/admin/invoices/new" icon={DollarSign} label="Fatura Kes" color="green" />
                            <QuickAction href="/admin/tickets" icon={MessageSquare} label="Destek Paneli" color="red" />
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT COLUMN (1/3) - System & Mini */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-6"
                >
                    {/* System Health */}
                    <div className="bg-neutral-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all duration-700" />

                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold flex items-center gap-2 text-lg">
                                <Server className="w-5 h-5 text-brand-400" />
                                Sistem Durumu
                            </h3>
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-bold text-green-400">ONLINE</span>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <HealthRow label="Veritabanı" status="Bağlı" active />
                            <HealthRow label="API Latency" status="18ms" active />
                            <HealthRow label="SSL Sertifikası" status="Geçerli" active />
                            <div className="h-px bg-neutral-800 my-4" />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-neutral-500 font-bold uppercase tracking-widest">Sürüm</span>
                                <span className="text-white font-mono bg-neutral-800 px-2 py-0.5 rounded">v2.4.0-stable</span>
                            </div>
                        </div>
                    </div>

                    {/* Blog Mini Stats */}
                    <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm group hover:border-brand-300 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                            <FileText className="w-24 h-24" />
                        </div>
                        <div className="text-sm font-bold text-brand-600 uppercase tracking-widest mb-1">Cari Takip</div>
                        <div className="text-4xl font-bold text-neutral-900 mb-6">{stats.blogPosts} <span className="text-lg font-normal text-neutral-400">İçerik</span></div>
                        <Link href="/admin/blog" className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:gap-4 transition-all group/btn">
                            İçerikleri Yönet
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
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
