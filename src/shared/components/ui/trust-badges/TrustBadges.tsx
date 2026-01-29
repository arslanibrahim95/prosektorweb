import React from 'react'
import { ShieldCheck, Award, FileCheck, CheckCircle2 } from 'lucide-react'

export default function TrustBadges() {
    return (
        <div className="w-full py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Badge
                    icon={<ShieldCheck className="w-8 h-8 text-emerald-600" />}
                    title="Bakanlık Onaylı"
                    desc="ÇSGB Yetkili Kurum"
                />
                <Badge
                    icon={<Award className="w-8 h-8 text-blue-600" />}
                    title="ISO 9001:2015"
                    desc="Kalite Yönetim Sistemi"
                />
                <Badge
                    icon={<FileCheck className="w-8 h-8 text-purple-600" />}
                    title="KVKK Uyumlu"
                    desc="Veri Güvenliği"
                />
                <Badge
                    icon={<CheckCircle2 className="w-8 h-8 text-orange-600" />}
                    title="TSE-HYB"
                    desc="Hizmet Yeterlilik"
                />
            </div>
        </div>
    )
}

function Badge({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white/50 backdrop-blur-sm border border-neutral-200 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center group cursor-default">
            <div className="mb-3 p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300 ring-1 ring-neutral-100">
                {icon}
            </div>
            <h3 className="font-semibold text-neutral-900 text-sm mb-1">{title}</h3>
            <p className="text-xs text-neutral-500">{desc}</p>
        </div>
    )
}
