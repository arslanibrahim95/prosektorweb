import { Skeleton } from "@/components/ui/Skeleton"
import { Shield } from "lucide-react"

export default function AdminDashboardLoading() {
    return (
        <div className="space-y-8 pb-10">
            <div className="space-y-10 pb-16">
                {/* Page Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-brand-600 font-black text-xs uppercase tracking-[.3em]">
                            <Shield className="w-4 h-4" />
                            Super Admin Command Center
                        </div>
                        <Skeleton className="h-16 w-96 rounded-2xl" />
                        <Skeleton className="h-6 w-1/2 rounded-lg" />
                    </div>

                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-32 rounded-2xl" />
                        <Skeleton className="h-12 w-12 rounded-xl" />
                    </div>
                </div>

                {/* FINANCIAL PULSE Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Skeleton className="h-[300px] rounded-[2.5rem] w-full" />
                    </div>

                    <div className="space-y-6">
                        <Skeleton className="h-[140px] rounded-3xl w-full" />
                        <Skeleton className="h-[140px] rounded-3xl w-full" />
                    </div>
                </div>

                {/* AI PRODUCTION & CHART Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <Skeleton className="lg:col-span-3 h-[400px] rounded-[2.5rem] w-full" />
                    <Skeleton className="lg:col-span-2 h-[400px] rounded-[2.5rem] w-full" />
                </div>

                {/* QUICK ACTIONS Skeleton */}
                <Skeleton className="h-[200px] rounded-[3rem] w-full" />
            </div>
        </div>
    )
}
